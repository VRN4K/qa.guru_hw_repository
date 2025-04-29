import {expect} from '@playwright/test';
import {test} from '../src/helpers/fixtures/fixtures';
import {CommentBuilder} from "../src/helpers/builders/comment.builder";
import errorMessages from "../src/helpers/errorMessages";

test.use({storageState: {cookies: [], origins: []}});

test.describe('Главная страница', () => {

    test('Описание товара не на английском языке', async ({webApp}) => {
        await webApp.main.clickNextPaginationPage();
        await expect(webApp.main.crashBugOverlay).toContainText(errorMessages.CRASH_ERROR_MESSAGE);
    });

});

test.describe('Карточка товара', () => {

    test('Описание товара не на английском языке', async ({webApp}) => {
        await webApp.main.gotoProductPage()
        await webApp.product.clickOnProductDescription();
        await expect(webApp.main.bugPopup).toContainText(errorMessages.BUG_ERROR_MESSAGE);
    });

    test('Ошибка при размещении комментария', async ({webApp}) => {
        await webApp.main.gotoProductPage()
        const comment = new CommentBuilder().addComment().addName().addEmail().addWebsite().generate();

        await webApp.product.postComment(comment.commentContent, comment.userName, comment.userEmail, comment.website)
        await expect(webApp.main.crashBugOverlay).toContainText(errorMessages.CRASH_ERROR_MESSAGE);
    });

    test('Ошибка 404 при переходе на страницу производителя', async ({webApp}) => {
        await webApp.main.gotoProductPage()
        await webApp.product.clickOnManufacturerTitle();
        await expect(webApp.main.bugPopup).toContainText(errorMessages.BUG_ERROR_MESSAGE);
    });

    test('Ошибка при переходе в Твиттер', async ({webApp}) => {
        await webApp.main.gotoProductPage();
        await webApp.product.clickOnTwitterIcon();
        await expect(webApp.main.bugPopup).toContainText(errorMessages.BUG_ERROR_MESSAGE);
    });

});

