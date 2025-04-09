import { faker } from '@faker-js/faker';

export class ArticleComment {
    constructor() {
          this.content = faker.lorem.words(20);
    }
}