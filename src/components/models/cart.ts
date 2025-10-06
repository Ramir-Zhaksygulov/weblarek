import { IProduct } from "../../types";
import { IEvents } from "../base/Events";

export class Cart {
  private items: IProduct[] = [];
  private events: IEvents; 

  constructor(events: IEvents) {
    this.events = events;
  }

  // Возвращает товары в корзине
  getItems(): IProduct[] {
    return this.items;
  }

  // Добавляет товар в корзину
  addItem(item: IProduct): void {
    this.items.push(item);
    this.events.emit("cart:itemAdded", { item }); 
    this.events.emit("cart:changed"); 
  }

  // Удаляет товар из корзины
  removeItem(item: IProduct): void {
    this.items = this.items.filter((i) => i.id !== item.id);
    this.events.emit("cart:itemRemoved", { item });
    this.events.emit("cart:changed");
  }

  // Очищает корзину
  clear(): void {
    this.items = [];
    this.events.emit("cart:cleared");
    this.events.emit("cart:changed");
  }

  // Возвращает общую стоимость товаров
  getTotalPrice(): number {
    return this.items.reduce((sum, item) => sum + (item.price ?? 0), 0);
  }

  // Возвращает количество товаров в корзине
  getCount(): number {
    return this.items.length;
  }

  // Проверяет, есть ли товар по ID
  hasItem(id: string): boolean {
    return this.items.some((item) => item.id === id);
  }
}
