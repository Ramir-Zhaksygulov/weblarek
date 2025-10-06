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

document.addEventListener("DOMContentLoaded", async () => {
  const events = new EventEmitter();
  const api = new Api(API_URL);
  const webLarekApi = new WebLarekApi(api);

  const buyer = new Buyer();
  const cart = new Cart(events);
  const products = new Products();

  // Интерфейс
  const header = new Header(events, ensureElement<HTMLElement>(".header"));
  const catalog = new Catalog(ensureElement<HTMLElement>(".gallery"), events);
  const modal = new Modal(
    ensureElement<HTMLElement>("#modal-container"),
    events
  );
  const basket = new Basket(events);

  // Формы
  const order = new Order(document.createElement("div"), events, buyer);
  const contacts = new Contacts(document.createElement("div"), events, buyer);
  const success = new OrderSuccess(document.createElement("div"), events);

  // Обновление корзины
  events.on("cart:changed", () => {
    basket.setItems(
      cart.getItems().map((product, index) => ({
        ...product,
        index: index + 1,
      }))
    );

    basket.setTotalPrice(cart.getTotalPrice());
    header.counter = cart.getCount();
  });

  // Добавление товара в корзину
  events.on<{ productId: string }>("card:add", ({ productId }) => {
    const product = products.getItemById(productId);
    if (product && !cart.hasItem(product.id)) {
      cart.addItem(product);
    }
  });

  // Удаление товара из корзины
  events.on<{ productId: string }>("card:remove", ({ productId }) => {
    const item = cart.getItems().find((i) => i.id === productId);
    if (item) {
      cart.removeItem(item);
    }
  });

  // Открытие корзины
  events.on("basket:open", () => {
    modal.open(basket.render());
  });

  // Переход к оформлению заказа
  events.on("basket:order", () => {
    if (cart.getCount() === 0) return;
    modal.open(order.render());
  });

  // После заполнения формы заказа — открываем контакты
  events.on("order:submitted", () => {
    modal.open(contacts.render());
  });

  // Отправка заказа
  events.on("contacts:submitted", async () => {
    const orderData = buyer.getOrderData(cart.getItems(), cart.getTotalPrice());

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

  // Предпросмотр карточки товара
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

  // Синхронизация при старте
  events.emit("cart:changed");
});
