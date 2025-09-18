import { IApi, IProduct } from "../../types";

export class WebLarekApi {
  private api: IApi;

  constructor(api: IApi) {
    this.api = api;
  }

  // Получить массив товаров с сервера
  async fetchProducts(): Promise<IProduct[]> {
    return this.api.get<IProduct[]>("/product/");
  }

  // Отправить заказ на сервер
  async sendOrder(order: object): Promise<object> {
    return this.api.post<object>("/order/", order);
  }
}
