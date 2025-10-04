import { Form } from "./Form";
import { IEvents } from "../base/Events";
import { ensureElement, cloneTemplate } from "../../utils/utils";
import { IBuyer } from "../../types";
import { Buyer } from "../models/buyer";

export type IOrderFormData = Pick<IBuyer, "payment" | "address">;

// Класс формы
export class Order extends Form<IOrderFormData> {
  constructor(container: HTMLElement, events: IEvents, private buyer: Buyer) {
    super(container, events);
  }

  // Рендерим форму заказа из шаблона
  public render(): HTMLElement {
    // клонируем HTML-шаблон формы заказа
    const orderTemplate = cloneTemplate<HTMLFormElement>("#order");

    // сохраняем ссылки на основные элементы
    this.formElement = orderTemplate as HTMLFormElement;
    this.submitButton = ensureElement<HTMLButtonElement>(
      ".order__button",
      this.formElement
    );
    this.errorContainer = ensureElement<HTMLElement>(
      ".form__errors",
      this.formElement
    );

    // задаём список полей, которые нужно проверять
    this.fieldsToValidate = ["payment", "address"];

    // сбрасываем форму перед использованием
    this.resetForm?.();
    // инициализируем обработчики для полей (оплата + адрес)
    this.initFields();
    // проверяем валидность сразу при загрузке
    this.checkValidity();
    // активируем общую инициализацию из базового Form
    this.init();

    return orderTemplate;
  }

  // Навешиваем обработчики на кнопки оплаты и поле адреса
  private initFields(): void {
    // кнопки для выбора способа оплаты
    const paymentButtons = Array.from(
      this.formElement.querySelectorAll<HTMLButtonElement>(
        "button[name='card'], button[name='cash']"
      )
    );

    // поле ввода адреса
    const addressInput = this.formElement.querySelector<HTMLInputElement>(
      "input[name='address']"
    );

    // при клике на кнопку — обновляем модель Buyer и визуальное состояние
    paymentButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.buyer.setPayment(button.name as IOrderFormData["payment"]);
        // сбрасываем выделение всех кнопок
        paymentButtons.forEach((btn) => (btn.style.backgroundColor = ""));
        // выделяем активную
        button.style.backgroundColor = "#5F8CC7";

        this.checkValidity();
      });
    });

    // при вводе адреса — обновляем Buyer и проверяем форму
    if (addressInput) {
      addressInput.addEventListener("input", () => {
        this.buyer.setAddress(addressInput.value);
        this.checkValidity();
      });
    }
  }

  // Проверяем валидность формы
  protected checkValidity(): boolean {
    // проверяем все необходимые поля через Buyer
    const validation = this.buyer.validateAll(this.fieldsToValidate);
    const message = this.buyer.getValidationMessage(validation.errors);

    // если невалидна — выводим ошибку и блокируем кнопку
    if (!validation.isValid) {
      this.showError(message);
      this.submitButton.disabled = true;
      return false;
    }

    // если всё ок — очищаем ошибки и активируем кнопку
    this.clearErrors();
    this.submitButton.disabled = false;
    return true;
  }

  // Действие при успешной отправке формы
  protected onSubmit(): void {
    this.events.emit("order:submitted", this.buyer.getData());
  }

  // Текст кнопки отправки
  protected getSubmitText(): string {
    return "Далее";
  }

  // Сброс формы (обнуляем данные и снимаем выделения)
  protected resetForm(): void {
    this.buyer.setPayment("");
    this.buyer.setAddress("");
    this.submitButton.disabled = true;

    const paymentButtons = Array.from(
      this.formElement.querySelectorAll<HTMLButtonElement>(
        "button[name='card'], button[name='cash']"
      )
    );
    paymentButtons.forEach((btn) => (btn.style.backgroundColor = ""));
  }
}
