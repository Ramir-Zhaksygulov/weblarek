import "./scss/styles.scss";

import { Products } from "./components/models/products";
import { Cart } from "./components/models/cart";
import { Buyer } from "./components/models/buyer";
import { WebLarekApi } from "./components/models/webLarekApi";

import { Api } from "./components/base/Api";
import { API_URL } from "./utils/constants";
import { EventEmitter } from "./components/base/Events";

import { Header } from "./components/Header";
import { Catalog } from "./components/Catalog";
import { CardCatalog } from "./components/cards/CardCatalog";
import { Modal } from "./components/Modal";
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
  const cart = new Cart();
  const products = new Products();

  // Инициализация основных компонентов
  const header = new Header(
    events,
    document.querySelector(".header") as HTMLElement
  );
  const catalog = new Catalog(
    document.querySelector(".gallery") as HTMLElement
  );
  const modal = new Modal(
    document.getElementById("modal-container") as HTMLElement,
    events
  );
  const basket = new Basket(events, cart);

  // Подписки на события
  events.on("cart:changed", () => (header.counter = cart.getCount()));

  events.on("card:add", ({ productId }: { productId: string }) => {
    const product = products.getItemById(productId);
    if (product && !cart.hasItem(product.id)) {
      cart.addItem(product);
      events.emit("cart:changed");
    }
  });

  events.on("card:remove", ({ productId }: { productId: string }) => {
    const item = cart.getItems().find((i) => i.id === productId);
    if (item) {
      cart.removeItem(item);
      events.emit("cart:changed");
    }
  });

  events.on("basket:open", () => modal.open(basket.render()));

  events.on("basket:order", () => {
    if (cart.getCount() === 0) return;
    startOrderProcess();
  });

  events.on("card:select", ({ productId }: { productId: string }) => {
    const product = products.getItemById(productId);
    if (product) {
      const inBasket = cart.hasItem(product.id);
      const previewCard = new CardPreview(
        document.createElement("div"),
        {
          ...product,
          inBasket,
          buttonText: inBasket ? "Удалить из корзины" : "Купить",
        },
        events
      );
      modal.open(previewCard.render());
    }
  });

  events.on("catalog:open", () => {
    modal.close();
    catalog.render();
  });

  // Загрузка товаров
  const items = await webLarekApi.fetchProducts();
  products.setItems(items);
  catalog.itemsList = items.map(
    (item) =>
      new CardCatalog(document.createElement("div"), { ...item }, events)
  );

  /** Запуск процесса оформления заказа */
  function startOrderProcess() {
    const orderContainer = document.createElement("div");
    const order = new Order(orderContainer, events, buyer);
    modal.open(order.render());

    const onOrderSubmitted = () => {
      events.off("order:submitted", onOrderSubmitted);

      const contactsContainer = document.createElement("div");
      const contacts = new Contacts(contactsContainer, events, buyer);
      modal.open(contacts.render());

      const onContactsSubmitted = async () => {
        events.off("contacts:submitted", onContactsSubmitted);

        const orderData = buyer.getOrderData(
          cart.getItems(),
          cart.getTotalPrice()
        );
        const total = cart.getTotalPrice();

        await webLarekApi.sendOrder(orderData);

        cart.clear();
        buyer.clear();
        events.emit("cart:changed");

        const successContainer = document.createElement("div");
        const orderSuccess = new OrderSuccess(successContainer, events);
        modal.open(orderSuccess.render(total));
      };

      events.on("contacts:submitted", onContactsSubmitted);
    };

    events.on("order:submitted", onOrderSubmitted);
  }
});
