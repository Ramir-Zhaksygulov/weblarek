import { Component } from "./base/Component";
import { cloneTemplate, ensureElement } from "../utils/utils";
import { IEvents } from "./base/Events";

// Класс корзины
export class Basket extends Component<{}> {
  protected events: IEvents;
  protected listContainer: HTMLElement;
  protected totalPriceElement: HTMLElement;
  protected orderButton: HTMLButtonElement;
  protected containerBasket: HTMLElement;

  constructor(events: IEvents) {
    super(document.createElement("div"));
    this.events = events;

    const basketTemplate = cloneTemplate<HTMLElement>("#basket");
    this.containerBasket = basketTemplate;

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

    this.orderButton.addEventListener("click", () => {
      this.events.emit("basket:order");
    });
  }

  // Устанавливает список товаров в корзине
  public setItems(items: HTMLElement[]): void {
    if (!items.length) {
      this.listContainer.innerHTML = "<div>Корзина пуста</div>";
      this.orderButton.disabled = true;
      this.resetScroll();
      return;
    }

    this.listContainer.innerHTML = "";
    this.listContainer.replaceChildren(...items);
    this.orderButton.disabled = false;
    this.updateScroll();
  }

  // Устанавливает список товаров в корзине
  public setTotalPrice(total: number): void {
    this.totalPriceElement.textContent = `${total} синапсов`;
  }

  // Скролл при большом количестве товаров
  protected updateScroll(): void {
    if (this.listContainer.children.length > 3) {
      this.listContainer.style.maxHeight = "360px";
      this.listContainer.style.overflowY = "auto";
      this.listContainer.style.paddingRight = "15px";
    } else {
      this.resetScroll();
    }
  }

  // Сбрасывает настройки скролла
  protected resetScroll(): void {
    this.listContainer.style.maxHeight = "";
    this.listContainer.style.overflowY = "";
    this.listContainer.style.paddingRight = "";
  }

  // Возвращает элемент корзины для вставки в DOM
  public render(): HTMLElement {
    return this.containerBasket;
  }
}
