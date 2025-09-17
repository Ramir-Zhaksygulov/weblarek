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

  // Валидация данных (простейшая)
  validate(): boolean {
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.data.email);
    const phoneValid = /^\+\d{6,15}$/.test(this.data.phone);
    const addressValid = this.data.address.trim().length > 5;
    const paymentValid = this.data.payment !== "";

    return emailValid && phoneValid && addressValid && paymentValid;
  }
}
