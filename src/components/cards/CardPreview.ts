import { Card } from "./Card";
import { cloneTemplate } from "../../utils/utils";
import { categoryMap } from "../../utils/constants";
import { IEvents } from "../base/Events";
import { IProduct } from "../../types/index";

// Интерфейс для превью товара
export interface ICardPreviewData extends IProduct {
  inBasket: boolean;
  buttonText: string;
}

// Класс карточки превью товара
export class CardPreview extends Card<ICardPreviewData> {
  protected inBasket: boolean;

  constructor(
    container: HTMLElement,
    props: ICardPreviewData,
    events: IEvents
  ) {
    super(container, props, events);
    this.inBasket = props.inBasket || false;
  }

  // Рендер карточки превью
  public render(): HTMLElement {
    const card = cloneTemplate<HTMLElement>("#card-preview");

    // Назначаем заголовок
    const titleEl = card.querySelector(".card__title");
    if (titleEl) titleEl.textContent = this.data.title;

    // Назначаем изображение
    const imgEl = card.querySelector<HTMLImageElement>(".card__image");
    if (imgEl && this.data.image) {
      this.setImage(imgEl, this.data.image, this.data.title);
    }

    // Назначаем цену
    const priceEl = card.querySelector(".card__price");
    if (priceEl) {
      priceEl.textContent =
        this.data.price != null
          ? this.formatPrice(this.data.price)
          : "Бесценно";
    }

    // Описание
    const descriptionEl = card.querySelector(".card__text");
    if (descriptionEl && this.data.description) {
      descriptionEl.textContent = this.data.description;
    }

    // Назначаем категорию и класс для стиля
    const categoryEl = card.querySelector(".card__category");
    if (categoryEl && this.data.category) {
      categoryEl.textContent = this.data.category;
      const categoryClass =
        categoryMap[this.data.category as keyof typeof categoryMap] ?? "";
      if (categoryClass) categoryEl.classList.add(categoryClass);
    }

    // Кнопка — меняем текст в зависимости от состояния inBasket
    const buttonEl = card.querySelector<HTMLButtonElement>(".card__button");
    if (buttonEl) {
      buttonEl.textContent = this.inBasket
        ? "Удалить из корзины"
        : this.data.buttonText || "Купить";

      // Если нет цены — кнопка неактивна
      if (!this.data.price) {
        buttonEl.disabled = true;
        buttonEl.classList.add("button_disabled");
      }

      // Обработчик кнопки добавления/удаления
      buttonEl.addEventListener("click", (e) => {
        e.stopPropagation();
        if (this.inBasket) {
          this.events.emit("card:remove", { productId: this.data.id });
          this.inBasket = false;
        } else {
          this.events.emit("card:add", { productId: this.data.id });
          this.inBasket = true;
        }

        // Меняем текст кнопки
        buttonEl.textContent = this.inBasket ? "Удалить из корзины" : "Купить";

        // Обновляем счётчик корзины
        this.events.emit("cart:changed");
      });
    }

    // Сохраняем данные в dataset
    this.setCardData(card);

    return card;
  }
}
