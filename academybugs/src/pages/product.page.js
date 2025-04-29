export class ProductPage {
    constructor(page) {
        this.commentField = page.getByRole('textbox', { name: 'Comment' });
        this.nameField = page.getByRole('textbox', { name: 'Name*' });
        this.emailField = page.getByRole('textbox', { name: 'Email*' });
        this.websiteField = page.getByRole('textbox', { name: 'Website' });
        this.postCommentButton = page.getByRole('button', { name: 'Post Comment' });
        this.manufacturerLink = page.locator('div.ec_details_manufacturer a');
        this.description = page.locator('div.ec_details_description').getByText('Nam nec tellus a odio').nth(1);
        this.twitterIcon = page.getByRole('link', { name: 'X', exact: true });
    }
    async clickOnProductDescription() {
        await this.description.click();
    }

    async postComment(comment, name, email, website) {
        await this.commentField.click();
        await this.commentField.fill(comment);

        await this.nameField.click();
        await this.nameField.fill(name);

        await this.emailField.click();
        await this.emailField.fill(email);

        await this.websiteField.click();
        await this.websiteField.fill(website);

        await this.postCommentButton.click();
    }

    async clickOnManufacturerTitle() {
        await this.manufacturerLink.click();
    }

    async clickOnTwitterIcon() {
        await this.twitterIcon.click();
    }
}
