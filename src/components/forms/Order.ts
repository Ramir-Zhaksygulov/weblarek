import { Form } from "./Form";
import { IEvents } from "../base/Events";
import { ensureElement, cloneTemplate } from "../../utils/utils";
import { IBuyer } from "../../types";
import { Buyer } from "../models/buyer";

export type IOrderFormData = Pick<IBuyer, "payment" | "address">;

// Класс формы оформления заказа
export class Order extends Form<IOrderFormData> {
  private orderTemplate!: HTMLElement;
  private paymentButtons: HTMLButtonElement[] = [];

  constructor(container: HTMLElement, events: IEvents, private buyer: Buyer) {
    super(container, events);
    this.orderTemplate = this.createTemplate();
  }

  // Создаёт и инициализирует шаблон формы
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

    this.fieldsToValidate = ["payment", "address"];

    // Сброс формы
    this.resetForm();

    // Инициализация полей
    this.initFields();

    // Проверка валидности при создании
    this.checkValidity();

    // Инициализация сабмита формы
    this.initSubmit();

    return template;
  }

  public render(): HTMLElement {
    return this.orderTemplate;
  }

  // Получаем кнопки оплаты
  private getPaymentButtons(): HTMLButtonElement[] {
    if (this.paymentButtons.length === 0) {
      this.paymentButtons = Array.from(
        this.formElement.querySelectorAll<HTMLButtonElement>(
          "button[name='card'], button[name='cash']"
        )
      );
    }
    return this.paymentButtons;
  }

  // Инициализация обработчиков
  private initFields(): void {
    const paymentButtons = this.getPaymentButtons();

    // Обработка кликов по кнопкам оплаты
    paymentButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.buyer.setPayment(button.name as IOrderFormData["payment"]);

        // Сбрасываем стили
        paymentButtons.forEach((btn) => (btn.style.backgroundColor = ""));

        // Выделяем выбранную
        button.style.backgroundColor = "#5F8CC7";

        // Проверяем валидность
        this.checkValidity();
      });
    });

    // Поле адреса
    const addressInput = this.formElement.querySelector<HTMLInputElement>(
      "input[name='address']"
    );
    if (addressInput) {
      addressInput.addEventListener("input", () => {
        this.buyer.setAddress(addressInput.value);
        this.checkValidity();
      });
    }
  }

  // Сабмит формы
  private initSubmit(): void {
    this.formElement.addEventListener("submit", (e) => {
      e.preventDefault();
      if (this.checkValidity()) {
        this.onSubmit();
      }
    });
  }

  // Проверка валидности
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

  // При успешной отправке формы
  protected onSubmit(): void {
    this.events.emit("order:submitted", this.buyer.getData());
  }

  protected getSubmitText(): string {
    return "Далее";
  }

  // Сброс формы
  protected resetForm(): void {
    this.buyer.setPayment("");
    this.buyer.setAddress("");
    this.submitButton.disabled = true;
    this.getPaymentButtons().forEach((btn) => (btn.style.backgroundColor = ""));
  }
}
