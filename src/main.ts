import "./scss/styles.scss";

import { Products } from "./components/models/products";
import { Cart } from "./components/models/cart";
import { Buyer } from "./components/models/buyer";
import { WebLarekApi } from "./components/models/webLarekApi";

import { Api } from "./components/base/Api";
import { API_URL } from "./utils/constants";
import { EventEmitter } from "./components/base/Events";
import { ensureElement } from "./utils/utils";

import { Header } from "./components/Header";
import { Catalog } from "./components/Catalog";
import { Modal } from "./components/Modal";
import { CardCatalog } from "./components/cards/CardCatalog";
import { CardPreview } from "./components/cards/CardPreview";
import { Basket } from "./components/Basket";
import { Order } from "./components/forms/Order";
import { Contacts } from "./components/forms/Contacts";
import { OrderSuccess } from "./components/OrderSuccess";
import { CardBasket } from "./components/cards/CardBasket";

document.addEventListener("DOMContentLoaded", async () => {
  const events = new EventEmitter(); // централизованный эмиттер событий
  const api = new Api(API_URL); // API слой
  const webLarekApi = new WebLarekApi(api); // API модели

  const buyer = new Buyer(); // модель покупателя
  const cart = new Cart(events); // модель корзины
  const products = new Products(); // модель каталога

  // Представления
  const header = new Header(events, ensureElement<HTMLElement>(".header"));
  const catalog = new Catalog(ensureElement<HTMLElement>(".gallery"), events);
  const modal = new Modal(
    ensureElement<HTMLElement>("#modal-container"),
    events
  );
  const basket = new Basket(events);

  const order = new Order(document.createElement("div"), events, buyer);
  const contacts = new Contacts(document.createElement("div"), events, buyer);
  const success = new OrderSuccess(document.createElement("div"), events);

  // Обновление корзины: пересоздаёт список карточек и обновляет цену
  const updateBasket = () => {
    const items = cart.getItems().map((product, index) => {
      const card = new CardBasket(
        document.createElement("div"),
        { ...product, index: index + 1 },
        events
      );
      return card.render();
    });
    basket.setItems(items);
    basket.setTotalPrice(cart.getTotalPrice());
    header.counter = cart.getCount();
  };

  // Формирование данных заказа
  const formOrderData = () => ({
    ...buyer.getData(),
    total: cart.getTotalPrice(),
    items: cart.getItems().map((item) => item.id),
  });

  // Слушатели событий
  events.on("cart:changed", updateBasket);

  events.on<{ productId: string }>("card:add", ({ productId }) => {
    const product = products.getItemById(productId);
    if (product && !cart.hasItem(product.id)) cart.addItem(product);
  });

  events.on<{ productId: string }>("card:remove", ({ productId }) => {
    const item = cart.getItems().find((i) => i.id === productId);
    if (item) cart.removeItem(item);
  });

  events.on("basket:open", () => modal.open(basket.render()));

  events.on("basket:order", () => {
    if (cart.getCount() === 0) return;
    modal.open(order.render());
  });

  events.on("order:submitted", () => modal.open(contacts.render()));

  events.on("contacts:submitted", async () => {
    const orderData = formOrderData();
    try {
      const response = await webLarekApi.sendOrder(orderData);
      cart.clear();
      buyer.clear();
      modal.open(success.render(response.total));
    } catch (err) {
      console.error("Ошибка при оформлении заказа:", err);
    }
  });

  // Загрузка каталога
  try {
    const items = await webLarekApi.fetchProducts();
    products.setItems(items);
    catalog.itemsList = items.map(
      (item) =>
        new CardCatalog(document.createElement("div"), { ...item }, events)
    );
    catalog.render();
  } catch (err) {
    console.error("Ошибка загрузки товаров:", err);
  }

  // Просмотр товара
  events.on<{ productId: string }>("card:select", ({ productId }) => {
    const product = products.getItemById(productId);
    if (!product) return;

    const inBasket = cart.hasItem(product.id);
    const preview = new CardPreview(
      document.createElement("div"),
      {
        ...product,
        inBasket,
        buttonText: inBasket ? "Удалить из корзины" : "Купить",
      },
      events
    );

    modal.open(preview.render());
  });

  // Возврат к каталогу
  events.on("catalog:open", () => {
    modal.close();
    catalog.render();
  });

  // Первичная загрузка корзины
  events.emit("cart:changed");
});
