export class LoginPage {
    constructor(page) {
        this.page = page;

        this.emailField = page.getByPlaceholder('Email');
        this.passwordField = page.getByPlaceholder('Password');

        this.signupButton = page.getByRole('button', { name: 'Login' });
    }

    async login(email, password){
        await this.emailField.click();
        await this.emailField.fill(email);

        await this.passwordField.click();
        await this.passwordField.fill(password);

        await this.signupButton.click();
    }

    async open(url) {
        await this.page.goto(url);
    }
}
