import { IProduct } from "../../types";
import { EventEmitter, IEvents } from "../base/Events";

export class Cart {
  private items: IProduct[] = [];
  public events: IEvents;

  constructor() {
    this.events = new EventEmitter();
  }

  // Получение товаров из корзины
  getItems(): IProduct[] {
    return this.items;
  }

  // Добавление товара
  addItem(item: IProduct): void {
    this.items.push(item);
    this.events.emit("cart:itemAdded", { item });
    this.events.emit("cart:changed", { items: this.items });
  }

  // Удаление товара
  removeItem(item: IProduct): void {
    this.items = this.items.filter((i) => i.id !== item.id);
    this.events.emit("cart:itemRemoved", { item });
    this.events.emit("cart:changed", { items: this.items });
  }

  // Очистка корзины
  clear(): void {
    this.items = [];
    this.events.emit("cart:cleared", { cleared: true });
    this.events.emit("cart:changed", { items: this.items });
  }

  // Стоимость всех товаров
  getTotalPrice(): number {
    return this.items.reduce((sum, item) => sum + (item.price ?? 0), 0);
  }

  // Количество товаров
  getCount(): number {
    return this.items.length;
  }

  // Проверка наличия по id
  hasItem(id: string): boolean {
    return this.items.some((item) => item.id === id);
  }
}
