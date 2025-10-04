import { Card } from "./Card";
import { cloneTemplate } from "../../utils/utils";
import { categoryMap } from "../../utils/constants";
import { IEvents } from "../base/Events";
import { IProduct } from "../../types";

// Класс карточки каталога
export class CardCatalog extends Card<IProduct> {
  constructor(container: HTMLElement, props: IProduct, events: IEvents) {
    super(container, props, events);
  }

  // Рендер карточки каталога
  public render(): HTMLElement {
    const card = cloneTemplate<HTMLElement>("#card-catalog");

    // Установка заголовка
    const titleEl = card.querySelector(".card__title");
    if (titleEl) titleEl.textContent = this.data.title;

    // Установка изображения
    const imgEl = card.querySelector<HTMLImageElement>(".card__image");
    if (imgEl && this.data.image) {
      this.setImage(imgEl, this.data.image, this.data.title);
    }

    // Установка цены
    const priceEl = card.querySelector(".card__price");
    if (priceEl) {
      priceEl.textContent =
        this.data.price != null
          ? this.formatPrice(this.data.price)
          : "Бесценно";
    }

    // Установка категории и класса для стиля
    const categoryEl = card.querySelector(".card__category");
    if (categoryEl && this.data.category) {
      categoryEl.textContent = this.data.category;
      const categoryClass =
        categoryMap[this.data.category as keyof typeof categoryMap] ?? "";
      if (categoryClass) categoryEl.classList.add(categoryClass);
    }

    // Сохраняем данные в dataset
    this.setCardData(card);

    // Генерация события при клике на карточку
    card.addEventListener("click", () => {
      this.events.emit("card:select", { productId: this.data.id });
    });

    return card;
  }
}
