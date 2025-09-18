import { IBuyer, TPayment } from "../../types";

export class Buyer {
  private data: IBuyer = {
    payment: "",
    email: "",
    phone: "",
    address: "",
  };

  // Сохранение всех данных
  setData(data: IBuyer): void {
    this.data = data;
  }

  // Установка отдельных полей
  setPayment(payment: TPayment): void {
    this.data.payment = payment;
  }

  setEmail(email: string): void {
    this.data.email = email;
  }

  setPhone(phone: string): void {
    this.data.phone = phone;
  }

  setAddress(address: string): void {
    this.data.address = address;
  }

  // Получение всех данныхs
  getData(): IBuyer {
    return this.data;
  }

  // Очистка данных
  clear(): void {
    this.data = {
      payment: "",
      email: "",
      phone: "",
      address: "",
    };
  }

  // Валидация данных покупателя
  validate(): { isValid: boolean; errors: Record<keyof IBuyer, string> } {
    const errors: Record<keyof IBuyer, string> = {
      payment: "",
      address: "",
      email: "",
      phone: "",
    };

    if (!this.data.payment) {
      errors.payment = "Необходимо выбрать способ оплаты (card или cash)";
    }

    if (!this.data.address.trim()) {
      errors.address = "Необходимо ввести адрес доставки";
    }

    if (!this.data.email.trim()) {
      errors.email = "Необходимо ввести адрес электронной почты";
    }

    if (!this.data.phone.trim()) {
      errors.phone = "Необходимо ввести номер телефона";
    }

    return {
      isValid: Object.values(errors).every((error) => error === ""),
      errors,
    };
  }
}
