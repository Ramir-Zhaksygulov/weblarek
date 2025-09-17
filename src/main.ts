import "./scss/styles.scss";

import { Products } from "./components/models/products";
import { Cart } from "./components/models/cart";
import { Buyer } from "./components/models/buyer";
import { WebLarekApi } from "./components/models/webLarekApi";

import { apiProducts } from "./utils/data";
import { Api } from "./components/base/Api";
import { API_URL } from "./utils/constants";

// Проверяем ProductCatalog
const productsModel = new Products();
productsModel.setItems(apiProducts.items);

console.log("Массив товаров из каталога:", productsModel.getItems());

// Проверяем Cart
const cartModel = new Cart();

// добавим первый товар из каталога
const firstProduct = productsModel.getItems()[0];
cartModel.addItem(firstProduct);
console.log("Корзина после добавления товара:", cartModel.getItems());

// удалим товар
cartModel.removeItem(firstProduct);
console.log("Корзина после удаления товара:", cartModel.getItems());

// Проверяем Buyer
const buyerModel = new Buyer();
buyerModel.setPhone("+77001234567");
buyerModel.setAddress("г. Алматы, ул. Абая, 10");
buyerModel.setEmail("ivan@example.com");
buyerModel.setPayment("card");

console.log("Данные покупателя:", buyerModel.getData());

// Создаем экземпляр Api и WebLarekApi
const api = new Api(API_URL);
const webApi = new WebLarekApi(api);

// Загружаем каталог с сервера
async function loadProducts() {
  try {
    const items = await webApi.fetchProducts();
    productsModel.setItems(items);
    console.log("Каталог из сервера:", productsModel.getItems());
  } catch (err) {
    console.error("Ошибка загрузки товаров:", err);
  }
}

loadProducts();
