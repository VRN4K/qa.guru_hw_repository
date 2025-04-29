import {MainPage} from "./main.page";
import {ProductPage} from "./product.page";

export class App {
    constructor(page) {
        this.main = new MainPage(page);
        this.product = new ProductPage(page);
    }
}