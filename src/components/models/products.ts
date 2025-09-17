import { IProduct } from "../../types";

export class Products {
  private items: IProduct[] = [];
  private selectedProduct: IProduct | null = null;

  // Сохранение массива товаров
  setItems(items: IProduct[]): void {
    this.items = items;
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
