import { Component } from "./base/Component";
import { CardCatalog } from "./cards/CardCatalog";

// Интерфейс для каталога товаров
interface ICatalog {
  items: CardCatalog[];
}

export class Catalog extends Component<ICatalog> {
  constructor(container: HTMLElement, items: CardCatalog[] = []) {
    super(container);
    this.items = items;
  }

  protected items: CardCatalog[] = [];

  // Устанавливает список карточек и автоматически рендерит каталог
  set itemsList(items: CardCatalog[]) {
    this.items = items;
    this.render();
  }

  // Рендер каталога — вставляем карточки в контейнер <main class="gallery">
  render(): HTMLElement {
    this.container.replaceChildren(...this.items.map((item) => item.render()));
    return this.container;
  }
}
