import { Form } from "./Form";
import { IEvents } from "../base/Events";
import { ensureElement, cloneTemplate } from "../../utils/utils";
import { IBuyer } from "../../types";
import { Buyer } from "../models/buyer";

export type IContactsFormData = Pick<IBuyer, "email" | "phone">;

// Класс формы
export class Contacts extends Form<IContactsFormData> {
  constructor(container: HTMLElement, events: IEvents, private buyer: Buyer) {
    super(container, events);

    // Клонируем шаблон формы
    const template = cloneTemplate<HTMLFormElement>("#contacts");

    // Очищаем контейнер перед вставкой
    container.replaceChildren(template);

    // Получаем элементы формы
    this.formElement = ensureElement<HTMLFormElement>(".form", container);
    this.submitButton = ensureElement<HTMLButtonElement>(
      ".button",
      this.formElement
    );
    this.errorContainer = ensureElement<HTMLElement>(
      ".form__errors",
      this.formElement
    );

    // Поля формы, которые нужно валидировать
    this.fieldsToValidate = ["email", "phone"];

    // Сброс формы
    this.resetForm?.();

    // Инициализация обработчиков для полей формы
    this.initFields();

    // Проверка валидности сразу при рендере
    this.checkValidity();

    // Инициализация формы
    this.init();
  }

  // Инициализация полей формы — навешиваем обработчики ввода
  private initFields(): void {
    const emailInput = this.formElement.querySelector<HTMLInputElement>(
      "input[name='email']"
    );
    const phoneInput = this.formElement.querySelector<HTMLInputElement>(
      "input[name='phone']"
    );

    if (emailInput) {
      emailInput.addEventListener("input", () => {
        // Обновляем модель покупателя
        this.buyer.setEmail(emailInput.value);
        // Проверяем валидность формы при изменении поля
        this.checkValidity();
      });
    }

    if (phoneInput) {
      phoneInput.addEventListener("input", () => {
        this.buyer.setPhone(phoneInput.value);
        this.checkValidity();
      });
    }
  }

  // Проверка валидности всех полей формы
  protected checkValidity(): boolean {
    const validation = this.buyer.validateAll(this.fieldsToValidate);
    const message = this.buyer.getValidationMessage(validation.errors);

    if (!validation.isValid) {
      // Показываем ошибку, если есть
      this.showError(message);
      // Блокируем кнопку сабмита
      this.submitButton.disabled = true;
      return false;
    }

    // Убираем сообщение об ошибке
    this.clearErrors();
    this.submitButton.disabled = false;
    return true;
  }

  // Действия при сабмите формы
  protected onSubmit(): void {
    // Генерируем событие, чтобы сообщить, что форма отправлена
    this.events.emit("contacts:submitted", this.buyer.getData());
  }

  protected getSubmitText(): string {
    // Текст кнопки сабмита
    return "Оплатить";
  }

  protected resetForm(): void {
    // Сброс формы — очищаем все поля и блокируем кнопку сабмита
    this.buyer.setEmail("");
    this.buyer.setPhone("");
    this.submitButton.disabled = true;
  }
}
