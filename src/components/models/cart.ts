import { IProduct } from "../../types";

export class Cart {
  private items: IProduct[] = [];

  // Получение товаров из корзины
  getItems(): IProduct[] {
    return this.items;
  }

  // Добавление товара
  addItem(item: IProduct): void {
    this.items.push(item);
  }

  // Удаление товара
  removeItem(item: IProduct): void {
    this.items = this.items.filter((i) => i.id !== item.id);
  }

  // Очистка корзины
  clear(): void {
    this.items = [];
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
