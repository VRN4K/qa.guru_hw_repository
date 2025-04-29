import {test as base} from '@playwright/test';
import {App} from "../../pages/app";
const URL = "https://academybugs.com/find-bugs/";

export const test = base.extend({
    webApp: async ({ page }, use) => {
        const app = new App(page);
        await app.main.open(URL);
        await use(app);
    }
});