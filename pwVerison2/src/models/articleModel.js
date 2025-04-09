import { faker } from '@faker-js/faker';

export class Article {
    constructor() {
      
          this.title = faker.lorem.words(2)
          this.description = faker.lorem.words(5)
          this.content = faker.lorem.words(15)
          this.tags = faker.lorem.word()
    }
}