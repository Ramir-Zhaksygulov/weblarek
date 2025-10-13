import { Form } from "./Form";
import { IEvents } from "../base/Events";
import { ensureElement, cloneTemplate } from "../../utils/utils";
import { IBuyer } from "../../types";

export type IContactsFormData = Pick<IBuyer, "email" | "phone">;

// Класс формы контактов
export class Contacts extends Form<IContactsFormData> {
  private contactsTemplate!: HTMLElement;
  private emailInput!: HTMLInputElement;
  private phoneInput!: HTMLInputElement;
  private formData: Partial<IContactsFormData> = {};

  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);
    this.contactsTemplate = this.createTemplate();
    this.init();
    this.initValidation();
  }

  // Создаёт DOM-шаблон формы контактов
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

    this.initFields();
    this.resetForm();

    return template;
  }

  // Отрисовывает форму контактов
  public render(): HTMLElement {
    this.setFormData(this.formData);
    return this.contactsTemplate;
  }

  // Инициализация полей формы и добавление обработчиков событий
  private initFields(): void {
    this.emailInput = ensureElement<HTMLInputElement>(
      "input[name='email']",
      this.formElement
    );
    this.phoneInput = ensureElement<HTMLInputElement>(
      "input[name='phone']",
      this.formElement
    );

    this.emailInput.addEventListener("input", () => {
      this.formData.email = this.emailInput.value;
      this.events.emit("contacts:change", { ...this.formData });
    });

    this.phoneInput.addEventListener("input", () => {
      this.formData.phone = this.phoneInput.value;
      this.events.emit("contacts:change", { ...this.formData });
    });
  }

  // Инициализация валидации формы
  private initValidation() {
    this.formElement.addEventListener("input", () => {
      this.events.emit("contacts:change", { ...this.formData });
    });
  }

  // Устанавливает данные формы
  public setFormData(data: Partial<IContactsFormData>) {
    this.formData = { ...data };
    if (data.email) this.emailInput.value = data.email;
    if (data.phone) this.phoneInput.value = data.phone;

    this.events.emit("contacts:change", { ...this.formData });
    this.checkValidity();
  }

  // Сбрасывает форму контактов
  public resetForm(): void {
    this.formData = {};
    this.emailInput.value = "";
    this.phoneInput.value = "";
    this.setSubmitEnabled(false);
    this.clearErrors();
    this.events.emit("contacts:change", { ...this.formData });
  }

  protected checkValidity(): boolean {
    const valid = !!this.formData.email && !!this.formData.phone;
    this.setSubmitEnabled(valid);
    return valid;
  }

  protected getSubmitText(): string {
    return "Оплатить";
  }

  protected onSubmit(): void {
    this.events.emit("contacts:submit", { ...this.formData });
  }
}
