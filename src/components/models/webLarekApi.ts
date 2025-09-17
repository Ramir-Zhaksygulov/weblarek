import { IApi, IProduct, IBuyer } from "../../types";

export class WebLarekApi {
  private api: IApi;

  constructor(api: IApi) {
    this.api = api;
  }

  // Получить массив товаров с сервера
  async fetchProducts(): Promise<IProduct[]> {
    const data = await this.api.get<{ items: IProduct[] }>("/product/");
    return data.items; // предположим, сервер возвращает объект { items: [...] }
  }

  // Отправить заказ на сервер
  async sendOrder(buyer: IBuyer, products: IProduct[]): Promise<object> {
    const orderData = {
      buyer,
      products,
    };

    return this.api.post("/order/", orderData, "POST");
  }
}
