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

import { TPayment, IProduct } from "./types";

// Точка входа приложения — выполняется после полной загрузки DOM
document.addEventListener("DOMContentLoaded", async () => {
  const events = new EventEmitter();
  const api = new Api(API_URL);
  const webLarekApi = new WebLarekApi(api);

  // Создаём модели данных
  const buyer = new Buyer(events);
  const cart = new Cart(events);
  const products = new Products(events);

  // Представления
  const header = new Header(events, ensureElement<HTMLElement>(".header"));
  const catalog = new Catalog(ensureElement<HTMLElement>(".gallery"), events);
  const modal = new Modal(
    ensureElement<HTMLElement>("#modal-container"),
    events
  );
  const basket = new Basket(events);

  const order = new Order(document.createElement("div"), events);
  const contacts = new Contacts(document.createElement("div"), events);
  const success = new OrderSuccess(document.createElement("div"), events);

  // Функция для обновления содержимого корзины
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

  events.on("cart:changed", updateBasket);

  // Добавление товара в корзину
  events.on<{ productId: string }>("card:add", ({ productId }) => {
    const product = products.getItemById(productId);
    if (product && !cart.hasItem(product.id)) cart.addItem(product);
  });

  // Удаление товара из корзины
  events.on<{ productId: string }>("card:remove", ({ productId }) => {
    const item = cart.getItems().find((i) => i.id === productId);
    if (item) cart.removeItem(item);
  });

  // Открытие корзины
  events.on("basket:open", () => modal.open(basket.render()));

  events.on("basket:order", () => {
    if (cart.getCount() === 0) return;
    const { errors } = buyer.validateAll(["payment", "address"]);
    order.showError(buyer.getValidationMessage(errors));
    modal.open(order.render());
  });

  // Обновление данных формы заказа
  events.on<{ payment?: TPayment; address?: string }>(
    "order:change",
    (data) => {
      if (data.payment !== undefined) buyer.setPayment(data.payment);
      if (data.address !== undefined) buyer.setAddress(data.address);

      const { isValid, errors } = buyer.validateAll(["payment", "address"]);
      order.showError(buyer.getValidationMessage(errors));
      order.setSubmitEnabled(isValid);
    }
  );

  // Отправка формы заказа
  events.on("order:submit", () => {
    modal.open(contacts.render());
  });

  // Обновление данных формы контактов
  events.on<{ email?: string; phone?: string }>("contacts:change", (data) => {
    if (data.email !== undefined) buyer.setEmail(data.email);
    if (data.phone !== undefined) buyer.setPhone(data.phone);

    const { isValid, errors } = buyer.validateAll(["email", "phone"]);
    contacts.showError(buyer.getValidationMessage(errors));
    contacts.setSubmitEnabled(isValid);
  });

  // Обновление данных формы контактов
  events.on("contacts:submit", async () => {
    const { isValid, errors } = buyer.validateAll(["email", "phone"]);
    if (!isValid) {
      contacts.showError(buyer.getValidationMessage(errors));
      return;
    }

    const orderData = {
      ...buyer.getData(),
      total: cart.getTotalPrice(),
      items: cart.getItems().map((item) => item.id),
    };

    try {
      const response = await webLarekApi.sendOrder(orderData);
      cart.clear();
      buyer.clear();
      modal.open(success.render(response.total));
      order.resetForm();
      contacts.resetForm();
    } catch (err) {
      console.error("Ошибка при оформлении заказа:", err);
    }
  });

  events.on<{ items: IProduct[] }>("products:itemsChanged", ({ items }) => {
    catalog.itemsList = items.map(
      (item) =>
        new CardCatalog(document.createElement("div"), { ...item }, events)
    );
    catalog.render();
  });

  // Загрузка каталога товаров
  try {
    const items = await webLarekApi.fetchProducts();
    products.setItems(items);
  } catch (err) {
    console.error("Ошибка загрузки товаров:", err);
  }

  // Открытие превью товара
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

  // Закрытие каталога
  events.on("catalog:open", () => modal.close());

  // Инициализация состояния корзины
  events.emit("cart:changed");
});
