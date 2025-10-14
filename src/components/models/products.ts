import { IProduct } from "../../types";
import { IEvents } from "../base/Events";

export class Products {
  private items: IProduct[] = [];
  private selectedProduct: IProduct | null = null;
  public events: IEvents;

  constructor(events: IEvents) {
    this.events = events;
  }

  // Сохранение массива товаров
  setItems(items: IProduct[]): void {
    this.items = items;
    this.events.emit("products:itemsChanged", { items: this.items });
  }

  // Получение массива товаров
  getItems(): IProduct[] {
    return this.items;
  }

  // Получение товара по id
  getItemById(id: string): IProduct | null {
    return this.items.find((item) => item.id === id) || null;
  }

  // Сохранение выбранного товара
  setSelectedItem(item: IProduct): void {
    this.selectedProduct = item;
  }

  // Получение выбранного товара
  getSelectedItem(): IProduct | null {
    return this.selectedProduct;
  }
}
