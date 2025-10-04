import { Component } from "./base/Component";
import { ensureElement } from "../utils/utils";
import { IEvents } from "./base/Events";

// Класс универсального модального окна
export class Modal extends Component<{}> {
  protected closeButton: HTMLButtonElement; // кнопка закрытия
  protected contentContainer: HTMLElement; // контейнер для содержимого

  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);

    this.closeButton = ensureElement<HTMLButtonElement>(
      ".modal__close",
      this.container
    );

    this.contentContainer = ensureElement<HTMLElement>(
      ".modal__content",
      this.container
    );

    // Закрытие модалки по кнопке
    this.closeButton.addEventListener("click", () => this.close());

    // Закрытие модалки при клике вне контента
    container.addEventListener("click", (event) => {
      if (event.target === container) this.close();
    });
  }

  // Открыть модальное окно и вставить контент
  public open(content: HTMLElement) {
    this.contentContainer.replaceChildren();
    this.contentContainer.appendChild(content);
    this.container.classList.add("modal_active");
    this.events.emit("modal:open");
  }

  // Закрыть модальное окно
  public close() {
    this.container.classList.remove("modal_active");
    this.events.emit("modal:close");
  }

  // Получить текущий контент модального окна
  public get content() {
    return this.contentContainer;
  }
}
