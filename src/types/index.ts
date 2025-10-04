export type ApiPostMethods = "POST" | "PUT" | "DELETE";

export interface IApi {
  get<T extends object>(uri: string): Promise<T>;
  post<T extends object>(
    uri: string,
    data: object,
    method?: ApiPostMethods
  ): Promise<T>;
}

// Тип для оплаты (например: "card", "cash" или "")
export type TPayment = "card" | "cash" | "";

// Интерфейс товара
export interface IProduct {
  id: string;
  description?: string;
  image?: string;
  title: string;
  category?: string;
  price: number | null;
}

// Интерфейс покупателя
export interface IBuyer {
  payment: TPayment;
  email: string;
  phone: string;
  address: string;
}

// Объект заказа, который мы отправляем на сервер
export interface IOrderRequest extends IBuyer {
  total: number;
  items: string[];
}

// Объект ответа от сервера при успешном заказе
export interface IOrderResponse {
  id: string;
  total: number;
}
