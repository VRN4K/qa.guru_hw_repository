import { faker } from '@faker-js/faker';

export class CommentBuilder {
    addComment() {
        this.commentContent = faker.lorem.word();
        return this;
    }
    addName() {
        this.userName = faker.person.firstName();
        return this;
    }
    addEmail() {
        this.userEmail = faker.internet.email();
        return this;
    }
    addWebsite() {
        this.website= faker.internet.domainName();
        return this;
    }
    generate() {
        return this;
    }
}