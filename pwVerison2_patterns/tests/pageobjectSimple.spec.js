import { test, expect } from '@playwright/test';
import { MainPage, ArticleCreationPage, LoginPage, RegisterPage, ArticlePage, SettingsPage } from '../src/pages/index';
import { UserBuilder, CommentBuilder, ArticleBuilder} from "../src/helpers/index";

const URl_UI = 'https://realworld.qa.guru/';

test.describe('Статьи', () => {
  test.beforeEach(async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const mainPage = new MainPage(page);
    const userBuilder = new UserBuilder().addUsername().addEmail().addPassword().generate();
    await mainPage.open(URl_UI);
    await mainPage.gotoRegister();

    await registerPage.register(userBuilder.username, userBuilder.email, userBuilder.password);
  });

  test('Создание новой статьи', async ({
    page
  }) => {
    const articleCreationPage = new ArticleCreationPage(page);
    const articlePage = new ArticlePage(page);
    const articleBuilder = new ArticleBuilder().addTitle().addContent().addDescription().addTags(3).generate();

    await articleCreationPage.gotoArticleCreation();
    await articleCreationPage.createNewArticle(articleBuilder.title, articleBuilder.description, articleBuilder.content, articleBuilder.tags);

    await articlePage.gotoArticlePage(articleBuilder.title);

    await expect(articlePage.articleTitle).toHaveText(articleBuilder.title);
    await expect(articlePage.articleContent).toHaveText(articleBuilder.content);
  });

  test('Публикация коментария к статье', async ({
    page
  }) => {
    const articleCreationPage = new ArticleCreationPage(page);
    const articlePage = new ArticlePage(page);

    const articleBuilder = new ArticleBuilder().addTitle().addContent().addDescription().addTags(3).generate();
    const commentBuilder = new CommentBuilder().addComment(7);

    await articleCreationPage.gotoArticleCreation();
    await articleCreationPage.createNewArticle(articleBuilder.title, articleBuilder.description, articleBuilder.content, articleBuilder.tags);

    await articlePage.gotoArticlePage(articleBuilder.title);
    await articlePage.publishComment(commentBuilder.content);

    await expect(articlePage.articleComment).toHaveText(commentBuilder.content);
  });
});

test.describe('Настройки', () => {
  const userBuilder = new UserBuilder().addUsername().addEmail().addPassword(10).generate();
  let mainPage;

  test.beforeEach(async ({ page }) => {
    const registerPage = new RegisterPage(page);
    mainPage = new MainPage(page);

    await mainPage.open(URl_UI);
    await mainPage.gotoRegister();

    await registerPage.register(userBuilder.username, userBuilder.email, userBuilder.password);
  });

  test('Смена пароля пользователя', async ({
    page
  }) => {
    await mainPage.gotoSettings();
    const settingsPage = new SettingsPage(page);
    let newPassword = new UserBuilder().addPassword(10).generate();

    await settingsPage.updatePassword(newPassword.password);
    await expect(settingsPage.updateSettingsButton).toBeHidden();
    
    await mainPage.gotoLogOut();
    await mainPage.gotoLogin();

    const loginPage = new LoginPage(page);
    await loginPage.login(userBuilder.email, newPassword.password);
  });
});
