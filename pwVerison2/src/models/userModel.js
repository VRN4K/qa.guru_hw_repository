import { faker } from '@faker-js/faker';

export class User {
    constructor() {
        this.username = faker.person.firstName();
        this.email = faker.internet.email();
        this.password = faker.internet.password({ length: 10 });
    }
}