import { test, expect } from '@playwright/test';
import { MainPage } from '../src/pages/mainPage';
import { RegisterPage } from '../src/pages/registerPage';
import { ArticleCreationPage } from '../src/pages/articleCreationPage';
import { ArticlePage } from '../src/pages/articlePage';
import { User } from '../src/models/userModel';
import { Article } from '../src/models/articleModel';
import { ArticleComment } from '../src/models/articleComment';
import { SettingsPage } from '../src/pages/settingsPage';
import {LoginPage} from "../src/pages/loginPage";

const URl_UI = 'https://realworld.qa.guru/';


test.describe('Статьи', () => {
  test.beforeEach(async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const mainPage = new MainPage(page);
    const user = new User();
    await mainPage.open(URl_UI);
    await mainPage.gotoRegister();

    await registerPage.register(user.username, user.email, user.password);
  });

  test('Создание новой статьи', async ({
    page
  }) => {
    const articleCreationPage = new ArticleCreationPage(page);
    const articlePage = new ArticlePage(page);
    const article = new Article();

    await articleCreationPage.gotoArticleCreation();
    await articleCreationPage.createNewArticle(article.title, article.description, article.content, article.tags);

    await articlePage.gotoArticlePage(article.title);

    await expect(articlePage.articleTitle).toHaveText(article.title);
    await expect(articlePage.articleContent).toHaveText(article.content);
  });

  test('Публикация коментария к статье', async ({
    page
  }) => {
    const articleCreationPage = new ArticleCreationPage(page);
    const articlePage = new ArticlePage(page);

    const article = new Article();
    const articleComment = new ArticleComment();

    await articleCreationPage.gotoArticleCreation();
    await articleCreationPage.createNewArticle(article.title, article.description, article.content, article.tags);

    await articlePage.gotoArticlePage(article.title);
    await articlePage.publishComment(articleComment.content);

    await expect(articlePage.articleComment).toHaveText(articleComment.content);
  });
});

test.describe('Настройки', () => {
  let user = new User();
  let mainPage;

  test.beforeEach(async ({ page }) => {
    const registerPage = new RegisterPage(page);
    mainPage = new MainPage(page);

    await mainPage.open(URl_UI);
    await mainPage.gotoRegister();

    await registerPage.register(user.username, user.email, user.password);
  });

  test('Смена пароля пользователя', async ({
    page
  }) => {
    await mainPage.gotoSettings();
    const settingsPage = new SettingsPage(page);
    let newPassword = new User().password;

    await settingsPage.updatePassword(newPassword);
    await expect(settingsPage.updateSettingsButton).toBeHidden();
    
    await mainPage.gotoLogOut();
    await mainPage.gotoLogin();

    const loginPage = new LoginPage(page);
    await loginPage.login(user.email, newPassword);
  });
});
