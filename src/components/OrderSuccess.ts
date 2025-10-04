import { Component } from "./base/Component";
import { cloneTemplate, ensureElement } from "../utils/utils";
import { IEvents } from "./base/Events";

// Класс отображения успешного оформления заказа
export class OrderSuccess extends Component<{}> {
  protected events: IEvents;

  constructor(container: HTMLElement, events: IEvents) {
    super(container);
    this.events = events;
  }

  public render(total?: number): HTMLElement {
    // Клонируем шаблон из HTML
    const template = cloneTemplate<HTMLElement>("#success");

    // Находим элемент описания результата заказа
    const descriptionElement = ensureElement<HTMLElement>(
      ".order-success__description",
      template
    );

    // Находим кнопку закрытия сообщения
    const closeButton = ensureElement<HTMLButtonElement>(
      ".order-success__close",
      template
    );

    // Обработчик кнопки закрытия
    closeButton.addEventListener("click", () => {
      this.events.emit("modal:close");
      this.events.emit("catalog:open");
    });

    // Если передана сумма заказа — обновляем текст описания
    if (total) {
      descriptionElement.textContent = `Списано ${total} синапсов`;
    }

    return template;
  }
}
