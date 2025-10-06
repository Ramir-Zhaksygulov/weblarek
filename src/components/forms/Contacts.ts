import { Form } from "./Form";
import { IEvents } from "../base/Events";
import { ensureElement, cloneTemplate } from "../../utils/utils";
import { IBuyer } from "../../types";
import { Buyer } from "../models/buyer";

export type IContactsFormData = Pick<IBuyer, "email" | "phone">;

// Класс формы Контактов
export class Contacts extends Form<IContactsFormData> {
  private contactsTemplate!: HTMLElement;
  private emailInput!: HTMLInputElement;
  private phoneInput!: HTMLInputElement;

  constructor(container: HTMLElement, events: IEvents, private buyer: Buyer) {
    super(container, events);

    // Создаём шаблон формы
    this.contactsTemplate = this.createTemplate();
  }

  // Создаёт и инициализирует шаблон формы контактов
  private createTemplate(): HTMLElement {
    const template = cloneTemplate<HTMLFormElement>("#contacts");

    this.formElement = template as HTMLFormElement;

    this.submitButton = ensureElement<HTMLButtonElement>(
      ".button",
      this.formElement
    );

    this.errorContainer = ensureElement<HTMLElement>(
      ".form__errors",
      this.formElement
    );

    // Поля формы, которые будем валидировать
    this.fieldsToValidate = ["email", "phone"];

    // Получаем элементы формы
    this.emailInput = ensureElement<HTMLInputElement>(
      "input[name='email']",
      this.formElement
    );
    this.phoneInput = ensureElement<HTMLInputElement>(
      "input[name='phone']",
      this.formElement
    );

    this.resetForm();
    this.initFields();
    this.checkValidity();
    this.initSubmit();

    return template;
  }

  // Возвращает готовый элемент формы
  public render(): HTMLElement {
    return this.contactsTemplate;
  }

  // Инициализация обработчиков полей формы
  private initFields(): void {
    if (this.emailInput) {
      this.emailInput.addEventListener("input", () => {
        this.buyer.setEmail(this.emailInput.value);
        this.checkValidity();
      });
    }

    if (this.phoneInput) {
      this.phoneInput.addEventListener("input", () => {
        this.buyer.setPhone(this.phoneInput.value);
        this.checkValidity();
      });
    }
  }

  // Инициализация сабмита формы
  private initSubmit(): void {
    this.formElement.addEventListener("submit", (e) => {
      e.preventDefault();
      if (this.checkValidity()) {
        this.onSubmit();
      }
    });

    this.submitButton.addEventListener("click", () => {
      this.formElement.requestSubmit();
    });
  }

  // Проверка валидности формы
  protected checkValidity(): boolean {
    const validation = this.buyer.validateAll(this.fieldsToValidate);
    const message = this.buyer.getValidationMessage(validation.errors);

    if (!validation.isValid) {
      this.showError(message);
      this.submitButton.disabled = true;
      return false;
    }

    this.clearErrors();
    this.submitButton.disabled = false;
    return true;
  }

  // При успешной отправке формы — вызываем событие
  protected onSubmit(): void {
    this.events.emit("contacts:submitted", this.buyer.getData());
  }

  protected getSubmitText(): string {
    return "Оплатить";
  }

  // Сброс формы — очищаем поля и выключаем кнопку
  protected resetForm(): void {
    this.buyer.setEmail("");
    this.buyer.setPhone("");
    this.submitButton.disabled = true;

    if (this.emailInput) this.emailInput.value = "";
    if (this.phoneInput) this.phoneInput.value = "";
  }
}
