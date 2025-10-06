import { Component } from "./base/Component";
import { CardCatalog } from "./cards/CardCatalog";
import { IEvents } from "./base/Events";

// Интерфейс для каталога товаров
interface ICatalog {
  items: CardCatalog[];
}

export class Catalog extends Component<ICatalog> {
  private events: IEvents;

  constructor(
    container: HTMLElement,
    events: IEvents,
    items: CardCatalog[] = []
  ) {
    super(container);
    this.events = events;
    this.items = items;

    // Подписка на событие рендера каталога
    this.events.on("catalog:render", () => {
      this.render();
    });
  }

  protected items: CardCatalog[] = [];

  set itemsList(items: CardCatalog[]) {
    this.items = items;
    this.events.emit("catalog:render");
  }

  render(): HTMLElement {
    this.container.replaceChildren(...this.items.map((item) => item.render()));
    return this.container;
  }
}
