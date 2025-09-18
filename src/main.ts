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
console.log("Есть ли товар в корзине?", cartModel.hasItem(firstProduct.id));
console.log("Количество товаров:", cartModel.getCount());
console.log("Общая стоимость:", cartModel.getTotalPrice());

// удалим товар
cartModel.removeItem(firstProduct);

console.log("Корзина после удаления товара:", cartModel.getItems());
console.log("Есть ли товар в корзине?", cartModel.hasItem(firstProduct.id));
console.log("Количество товаров:", cartModel.getCount());

// Добавим несколько товаров для проверки очистки
const secondProduct = productsModel.getItems()[1];
cartModel.addItem(firstProduct);
cartModel.addItem(secondProduct);

console.log("Корзина после добавления товара:", cartModel.getItems());
console.log("Количество товаров:", cartModel.getCount());
console.log("Общая стоимость:", cartModel.getTotalPrice());

// // очистим корзину
cartModel.clear();

console.log("Корзина после очистки:", cartModel.getItems());

// Проверяем Buyer
const buyerModel = new Buyer();

// сохраняем часть данных
buyerModel.setPhone("+77001234567");
buyerModel.setEmail("ivan@example.com");

console.log("Данные покупателя:", buyerModel.getData());
console.log("Ошибки валидации:", buyerModel.validate());

buyerModel.setPayment("card");
buyerModel.setAddress("Almaty");

console.log("Данные покупателя:", buyerModel.getData());
console.log("Ошибки валидации:", buyerModel.validate());

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

// Формируем заказ и отправляем
async function sendOrderToServer() {
  cartModel.addItem(firstProduct);
  cartModel.addItem(secondProduct);

  if (!cartModel.getCount()) {
    console.warn("Корзина пуста, заказ не отправлен");
    return;
  }

  const validation = buyerModel.validate();
  if (!validation.isValid) {
    console.warn("Покупатель некорректен:", validation.errors);
    return;
  }

  const order = {
    payment: buyerModel.getData().payment,
    email: buyerModel.getData().email,
    phone: buyerModel.getData().phone,
    address: buyerModel.getData().address,
    total: cartModel.getTotalPrice(),
    items: cartModel.getItems().map((item) => item.id),
  };

  console.log("Формируемый заказ:", order);

  try {
    const response = await webApi.sendOrder(order);
    console.log("Ответ сервера:", response);
  } catch (err) {
    console.error("Ошибка отправки заказа:", err);
  }
}

// Отправляем заказ
sendOrderToServer();
