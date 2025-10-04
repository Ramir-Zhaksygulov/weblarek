import { Component } from "./base/Component";
import { cloneTemplate, ensureElement } from "../utils/utils";
import { CardBasket, ICardBasketData } from "./cards/CardBasket";
import { IEvents } from "./base/Events";
import { Cart } from "./models/cart";

// Класс корзины
export class Basket extends Component<{}> {
  protected items: CardBasket[] = [];
  protected events: IEvents;
  protected cart: Cart;
  protected listContainer: HTMLElement;
  protected totalPriceElement: HTMLElement;
  protected orderButton: HTMLButtonElement;
  protected containerBasket: HTMLElement;

  constructor(events: IEvents, cart: Cart) {
    super(document.createElement("div"));
    this.events = events;
    this.cart = cart;

    // клонируем шаблон корзины из HTML
    const basketTemplate = cloneTemplate<HTMLElement>("#basket");
    this.containerBasket = basketTemplate;

    // получаем нужные элементы внутри корзины
    this.listContainer = ensureElement<HTMLElement>(
      ".basket__list",
      basketTemplate
    );
    this.totalPriceElement = ensureElement<HTMLElement>(
      ".basket__price",
      basketTemplate
    );
    this.orderButton = ensureElement<HTMLButtonElement>(
      ".basket__button",
      basketTemplate
    );

    // обработчик на кнопку "Оформить заказ"
    this.orderButton.addEventListener("click", () => {
      this.events.emit("basket:order");
    });

    // обработчик удаления товара из корзины (по событию от карточки)
    this.events.on("basket:item:remove", ({ index }: { index: number }) => {
      const item = this.items.find((i) => i.getIndex() === index);
      if (item) {
        const productId = item.data.id;
        const product = this.cart.getItems().find((i) => i.id === productId);
        if (product) {
          // удаляем товар из модели корзины
          this.cart.removeItem(product);
          // перерисовываем корзину
          this.render();
          // обновляем счётчик в шапке
          this.events.emit("cart:changed");
        }
      }
    });
  }

  // рендер корзины
  public render(): HTMLElement {
    this.items = [];

    const cartItems = this.cart.getItems();

    // если корзина пуста — выводим заглушку
    if (cartItems.length === 0) {
      this.listContainer.innerHTML = "<div>Корзина пуста</div>";
    } else {
      this.listContainer.innerHTML = "";
      cartItems.forEach((product, idx) => {
        const cardData: ICardBasketData = {
          ...product,
          index: idx + 1,
        };
        const card = new CardBasket(this.listContainer, cardData, this.events);
        this.items.push(card);
      });

      // заменяем содержимое контейнера на карточки
      this.listContainer.replaceChildren(
        ...this.items.map((item) => item.render())
      );
    }

    // обновляем общую сумму
    this.totalPriceElement.textContent = `${this.cart.getTotalPrice()} синапсов`;
    this.orderButton.disabled = cartItems.length === 0;

    return this.containerBasket;
  }
}
