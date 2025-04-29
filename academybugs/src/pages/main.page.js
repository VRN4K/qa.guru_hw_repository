export class MainPage {
    constructor(page) {
        this.page = page;
        this.paginationButton = page.getByRole('link', { name: '50' });
        this.selectOptionsButton = page.locator('#ec_product_image_3981370').getByRole('link', { name: 'Select Options' });
        this.bugPopup = page.locator('#bug-popup');
        this.crashBugOverlay = page.locator('html');
    }
    async open(url) {
        await this.page.goto(url);
    }
    async clickNextPaginationPage() {
        await this.paginationButton.click();
    }
    async gotoProductPage() {
        await this.selectOptionsButton.click();
    }
}