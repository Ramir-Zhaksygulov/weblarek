import { Component } from "../base/Component";
import { setElementData } from "../../utils/utils";
import { IEvents } from "../base/Events";
import { CDN_URL } from "../../utils/constants";
import { IProduct } from "../../types/index";

// Абстрактный класс карточки товара
export abstract class Card<T extends IProduct> extends Component<T> {
  public data: T;
  public events: IEvents;

  constructor(container: HTMLElement, data: T, events: IEvents) {
    super(container);
    this.data = data;
    this.events = events;
  }

  // Устанавливает изображение карточки
  protected setImage(img: HTMLImageElement, url: string, alt?: string) {
    img.src = `${CDN_URL}/${url}`;
    img.alt = alt || "";
  }

  // Форматирует цену в виде "10 000 синапсов"
  protected formatPrice(price: string | number): string {
    if (price == null) return "";
    return `${new Intl.NumberFormat("ru-RU").format(Number(price))} синапсов`;
  }

  // Записывает данные карточки в dataset
  protected setCardData(element: HTMLElement) {
    setElementData(element, {
      id: this.data.id ?? "",
      title: this.data.title,
      price: this.data.price ?? "",
      imageUrl: this.data.image ?? "",
      category: this.data.category ?? "",
      description: this.data.description ?? "",
    });
  }

  // Абстрактный метод для рендера карточки
  public abstract render(): HTMLElement;
}
