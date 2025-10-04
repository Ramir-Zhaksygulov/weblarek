import { Card } from "./Card";
import { cloneTemplate } from "../../utils/utils";
import { IEvents } from "../base/Events";
import { IProduct } from "../../types";

// Интерфейс для данных корзины
export interface ICardBasketData extends IProduct {
  index: number;
}

// Класс карточки товара в корзине
export class CardBasket extends Card<ICardBasketData> {
  protected index: number;

  constructor(container: HTMLElement, props: ICardBasketData, events: IEvents) {
    super(container, props, events);
    this.index = props.index;
  }

  // Рендер карточки корзины
  public render(): HTMLElement {
    const card = cloneTemplate<HTMLElement>("#card-basket");

    // Порядковый номер
    const indexEl = card.querySelector(".basket__item-index");
    if (indexEl) indexEl.textContent = String(this.index);

    // Название товара
    const titleEl = card.querySelector(".card__title");
    if (titleEl) titleEl.textContent = this.data.title;

    // Цена товара
    const priceEl = card.querySelector(".card__price");
    if (priceEl) {
      priceEl.textContent =
        this.data.price != null ? this.formatPrice(this.data.price) : "";
    }

    // Кнопка удаления
    const buttonEl = card.querySelector<HTMLButtonElement>(
      ".basket__item-delete"
    );
    if (buttonEl) {
      buttonEl.addEventListener("click", () => {
        this.events.emit("basket:item:remove", { index: this.index });
      });
    }

    // Сохраняем данные в dataset
    this.setCardData(card);

    return card;
  }

  // Устанавливаем индекс товара
  public setIndex(index: number) {
    this.index = index;
  }

  // Получаем индекс товара
  public getIndex(): number {
    return this.index;
  }

  // Получаем цену товара
  public getPrice(): number {
    return Number(this.data.price) || 0;
  }
}
