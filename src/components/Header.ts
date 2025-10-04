import { ensureElement } from "../utils/utils";
import { IEvents } from "./base/Events";
import { Component } from "./base/Component";

// Интерфейс для данных шапки сайта
interface IHeader {
  counter: number;
}

export class Header extends Component<IHeader> {
  protected counterElement: HTMLElement;
  protected basketButton: HTMLButtonElement;

  constructor(protected events: IEvents, container: HTMLElement) {
    super(container);

    // Находим элемент счётчика корзины
    this.counterElement = ensureElement<HTMLElement>(
      ".header__basket-counter",
      this.container
    );

    // Находим кнопку корзины
    this.basketButton = ensureElement<HTMLButtonElement>(
      ".header__basket",
      this.container
    );

    // Навешиваем обработчик клика на корзину
    this.basketButton.addEventListener("click", () => {
      this.events.emit("basket:open");
    });
  }

  // Устанавливаем количество товаров в корзине
  set counter(value: number) {
    this.counterElement.textContent = String(value);
  }

  // Получаем текущее количество
  get counter(): number {
    return Number(this.counterElement.textContent) || 0;
  }
}
