import { Form } from "./Form";
import { IEvents } from "../base/Events";
import { ensureElement, cloneTemplate } from "../../utils/utils";
import { IBuyer } from "../../types";

export type IOrderFormData = Pick<IBuyer, "payment" | "address">;

// Класс формы заказа
export class Order extends Form<IOrderFormData> {
  private orderTemplate!: HTMLElement;
  private paymentButtons: HTMLButtonElement[] = [];
  private formData: Partial<IOrderFormData> = {};

  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);
    this.orderTemplate = this.createTemplate();
    this.init();
    this.initValidation();
  }

  // Создаёт DOM-шаблон формы заказа
  private createTemplate(): HTMLElement {
    const template = cloneTemplate<HTMLFormElement>("#order");
    this.formElement = template as HTMLFormElement;

    this.submitButton = ensureElement<HTMLButtonElement>(
      ".order__button",
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

  // Отрисовывает форму заказа
  public render(): HTMLElement {
    return this.orderTemplate;
  }

  // Возвращает список кнопок выбора оплаты
  private getPaymentButtons(): HTMLButtonElement[] {
    if (!this.paymentButtons.length) {
      this.paymentButtons = Array.from(
        this.formElement.querySelectorAll<HTMLButtonElement>(
          "button[name='card'], button[name='cash']"
        )
      );
    }
    return this.paymentButtons;
  }

  // Инициализация полей формы и добавление обработчиков событий
  private initFields(): void {
    this.getPaymentButtons().forEach((button) => {
      button.addEventListener("click", () => {
        this.formData.payment = button.name as IOrderFormData["payment"];
        this.events.emit("order:change", { ...this.formData });
        this.updatePaymentUI(button);
      });
    });

    const addressInput = this.formElement.querySelector<HTMLInputElement>(
      "input[name='address']"
    );
    if (addressInput) {
      addressInput.addEventListener("input", () => {
        this.formData.address = addressInput.value;
        this.events.emit("order:change", { ...this.formData });
      });
    }
  }

  private updatePaymentUI(activeButton: HTMLButtonElement) {
    this.getPaymentButtons().forEach((btn) => (btn.style.backgroundColor = ""));
    activeButton.style.backgroundColor = "#5F8CC7";
  }

  // Инициализация валидации формы
  private initValidation() {
    this.formElement.addEventListener("input", () => {
      this.events.emit("order:change", { ...this.formData });
    });
  }

  // Устанавливает данные формы
  public setFormData(data: Partial<IOrderFormData>) {
    this.formData = { ...data };
    if (data.payment) {
      const btn = this.getPaymentButtons().find((b) => b.name === data.payment);
      if (btn) this.updatePaymentUI(btn);
    }
    if (data.address) {
      const addressInput = this.formElement.querySelector<HTMLInputElement>(
        "input[name='address']"
      );
      if (addressInput) addressInput.value = data.address;
    }
    this.events.emit("order:change", { ...this.formData });
  }

  // Сбрасывает форму заказа
  public resetForm(): void {
    this.getPaymentButtons().forEach((btn) => (btn.style.backgroundColor = ""));
    this.formData = {};
    this.setSubmitEnabled(false);
    this.clearErrors();
    const addressInput = this.formElement.querySelector<HTMLInputElement>(
      "input[name='address']"
    );
    if (addressInput) addressInput.value = "";
    this.events.emit("order:change", {});
  }

  protected checkValidity(): boolean {
    return !!this.formData.payment && !!this.formData.address;
  }

  protected getSubmitText(): string {
    return "Оплатить";
  }

  protected onSubmit(): void {
    this.events.emit("order:submit", { ...this.formData });
  }
}
