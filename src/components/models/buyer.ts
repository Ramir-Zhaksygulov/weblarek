import { IBuyer, TPayment } from "../../types";
import { IEvents } from "../base/Events";

//Модель покупателя:
export class Buyer {
  private data: IBuyer = {
    payment: "",
    email: "",
    phone: "",
    address: "",
  };

  constructor(public events: IEvents) {}

  // Устанавливает способ оплаты
  setPayment(payment: TPayment): void {
    this.data.payment = payment;
  }

  // Устанавливает email
  setEmail(email: string): void {
    this.data.email = email;
  }

  // Устанавливает номер телефона
  setPhone(phone: string): void {
    this.data.phone = phone;
  }

  // Устанавливает адрес доставки
  setAddress(address: string): void {
    this.data.address = address;
  }

  // Возвращает текущие данные покупателя
  getData(): IBuyer {
    return { ...this.data };
  }

  // Очищает данные покупателя
  clear(): void {
    this.data = { payment: "", email: "", phone: "", address: "" };
  }

  // Возвращает сообщение об ошибке по умолчанию
  private getErrorMessage(field: keyof IBuyer): string {
    const messages: Record<keyof IBuyer, string> = {
      payment: "Необходимо выбрать способ оплаты",
      address: "Необходимо указать адрес",
      email: "Необходимо указать email",
      phone: "Необходимо указать номер телефона",
    };
    return messages[field];
  }

  // Валидирует выбранные поля
  validateAll(fields: (keyof IBuyer)[]): {
    isValid: boolean;
    errors: Partial<Record<keyof IBuyer, string>>;
  } {
    const errors: Partial<Record<keyof IBuyer, string>> = {};

    fields.forEach((field) => {
      const value = (this.data[field] || "").toString().trim();
      if (!value) {
        errors[field] = this.getErrorMessage(field);
      }
    });

    return { isValid: Object.keys(errors).length === 0, errors };
  }

  // Формирует текст ошибки для отображения
  getValidationMessage(errors: Partial<Record<keyof IBuyer, string>>): string {
    const messages = Object.values(errors).filter(Boolean);
    if (messages.length > 1) return "Необходимо заполнить все поля";
    return messages.join(". ");
  }
}
