import {test, expect} from '@playwright/test';
import {ChallengesApi} from "../src/services/index";
import {getRandomNumber, getRandomNumberNotContainedInArray} from "../src/index";
import endpoints from "../src/services/endpoints";
import {TodoBuilder} from "../src/builders/todo.builder";
import payloads from "../src/services/payloads";

const URL = 'https://apichallenges.herokuapp.com/';


test.describe.serial('API challenge', () => {
    let api = new ChallengesApi(URL);
    let toDosIdList = [];
    let newTodo;

    test.beforeAll(async () => {
        await api.auth(endpoints.getToken);

        let response = await api.get(endpoints.getAllToDo);
        const todos = (await response.json()).todos.forEach((element) => toDosIdList[element.id] = element.title);

        newTodo = new TodoBuilder().addTitle().addDoneStatus(true).addDescription().generate()
    });

    test("Получить список заданий get /challenges",
        {tag: '@get'},
        async () => {
            const response = await api.get(endpoints.getAllChallenges);

            expect(response.status).toBe(200);
            expect((await response.json()).challenges.length).toBe(59);
        });

    test('Получить список ToDo get /todos (200)',
        {tag: '@get'},
        async () => {

            const response = await api.get(endpoints.getAllToDo);
            const body = (await response.json()).todos;

            expect(response.status).toBe(200);
            expect(body.length).toBe(10);
        });

    test('Получить ошибку необходимости множественного числа get /todo (404) not plural',
        {tag: '@get'},
        async () => {
            const response = await api.get(endpoints.getToDoNotPlural);

            expect(response.status).toBe(404);
        });

    test('Получить ToDo по id get /todos/{id} (200)',
        {tag: '@get'},
        async () => {
            let todosId = getRandomNumber(Object.keys(toDosIdList))
            const response = await api.get(endpoints.getToDoById(todosId))

            expect(response.status).toBe(200);
            expect(toDosIdList[`'${todosId}'`]).toBe((await response.json()).id);
        });

    test('Получить ToDo по не существующему id get /todos/{id} (404)',
        {tag: '@get'},
        async () => {
            const todoId = getRandomNumberNotContainedInArray(toDosIdList.length)
            const response = await api.get(endpoints.getToDoById(todoId))

            expect(response.status).toBe(404);
        });

    test('GET /todos (200) ?filter',
        {tag: '@get'},
        async () => {
            let todosId = getRandomNumber(Object.keys(toDosIdList))
            const postPayload = payloads.updateDoneStatusPayload(true);
            await api.post(endpoints.updateOrDeleteById(todosId), postPayload);

            const response = await api.get(endpoints.getFilteredTodoByDoneStatus('true'));
            const responseBody = await response.json();

            expect(response.status).toBe(200);
            responseBody.todos.forEach((element) => expect(element.doneStatus).toBe(true));
        });

    test('Получить заголовки head /todos (200)',
        {tag: '@head'},
        async () => {
            const response = await api.head(endpoints.getAllToDo);

            expect(response.status).toBe(200);
        });

    test('Создать новый ToDo post /todos (201)',
        {tag: '@post'},
        async () => {
            const postPayload = payloads.newToDoPayload(newTodo.title, newTodo.doneStatus, newTodo.description);
            const response = await api.post(endpoints.getAllToDo, postPayload);
            const todo = await response.json();

            expect(response.status).toBe(201);
            expect(newTodo.title).toBe(todo.title);
            expect(newTodo.doneStatus).toBe(todo.doneStatus);
            expect(newTodo.description).toBe(todo.description);
        });

    test('POST /todos (400) doneStatus',
        {tag: '@post'},
        async () => {
            let wrongStatusTodo = new TodoBuilder().addTitle().addDoneStatus('test').addDescription().generate()
            const postPayload = payloads.wrongToDoStatusPayload(wrongStatusTodo.title, wrongStatusTodo.doneStatus, wrongStatusTodo.description);

            const response = await api.post(endpoints.getAllToDo, postPayload);
            expect(response.status).toBe(400);
        });

    test('POST /todos (400) title too long',
        {tag: '@post'},
        async () => {
            let longTitleTodo = new TodoBuilder().addTitle(100).addDoneStatus(false).addDescription().generate()
            const postPayload = payloads.newToDoPayload(longTitleTodo.title, longTitleTodo.doneStatus, longTitleTodo.description);

            const response = await api.post(endpoints.getAllToDo, postPayload);
            expect(response.status).toBe(400);
        });

    test('POST /todos (400) description too long',
        {tag: '@post'},
        async () => {
            let longDescriptionTodo = new TodoBuilder().addTitle().addDoneStatus(false).addDescription(500).generate()
            const postPayload = payloads.newToDoPayload(longDescriptionTodo.title, longDescriptionTodo.doneStatus, longDescriptionTodo.description);

            const response = await api.post(endpoints.getAllToDo, postPayload);
            expect(response.status).toBe(400);
        });

    test('POST /todos (201) max out content',
        {tag: '@post'},
        async () => {
            let maxOutTodo = new TodoBuilder().addTitleBySymbols(50).addDoneStatus(false).addDescriptionBySymbols(200).generate()
            const postPayload = payloads.newToDoPayload(maxOutTodo.title, maxOutTodo.doneStatus, maxOutTodo.description);

            const response = await api.post(endpoints.getAllToDo, postPayload);
            const responseBody = await response.json();

            expect(response.status).toBe(201);
            expect(responseBody.title).toBe(maxOutTodo.title);
            expect(responseBody.title.length).toBe(50);
            expect(responseBody.description).toBe(maxOutTodo.description);
            expect(responseBody.description.length).toBe(200);
        });

    test('POST /todos (413) content too long',
        {tag: '@post'},
        async () => {
            let longContentTodo = new TodoBuilder().addTitle(1000).addDoneStatus(false).addDescription(1000).generate()
            const postPayload = payloads.newToDoPayload(longContentTodo.title, longContentTodo.doneStatus, longContentTodo.description);

            const response = await api.post(endpoints.getAllToDo, postPayload);
            expect(response.status).toBe(413);
        });

    test('POST /todos (400) extra',
        {tag: '@post'},
        async () => {
            const postPayload = payloads.unrecognisedFieldPayload(newTodo.title, newTodo.doneStatus, newTodo.description);
            const response = await api.post(endpoints.getAllToDo, postPayload);

            expect(response.status).toBe(400);
        });

    test('PUT /todos/{id} (400)',
        {tag: '@put'},
        async () => {
            let todoWithId = new TodoBuilder().addId(45).addTitle().addDoneStatus(false).addDescription().generate()
            const postPayload = payloads.newToDoPayload(todoWithId.title, todoWithId.doneStatus, todoWithId.description);
            const response = await api.put(endpoints.getToDoById(todoWithId.id), postPayload);

            expect(response.status).toBe(400);
        });

    test('POST /todos/{id} (200)',
        {tag: '@post'},
        async () => {
            let todosId = getRandomNumber(Object.keys(toDosIdList));
            const newDescription = new TodoBuilder().addDescription().generate().description;

            const postPayload = payloads.updateDescriptionPayload(newDescription);
            const response = await api.post(endpoints.updateOrDeleteById(todosId),postPayload)
            const responseBody = await response.json();

            expect(response.status).toBe(200);
            expect(responseBody.description).toBe(newDescription);
        });

    test('POST /todos/{id} (404)',
        {tag: '@post'},
        async () => {
            let todosId = getRandomNumberNotContainedInArray(Object.keys(toDosIdList));
            const newDescription = new TodoBuilder().addDescription().generate().description;

            const postPayload = payloads.updateDescriptionPayload(newDescription);
            const response = await api.post(endpoints.updateOrDeleteById(todosId),postPayload)

            expect(response.status).toBe(404);
        });

    test('PUT /todos/{id} full (200)',
        {tag: '@put'},
        async () => {
            let todosId = getRandomNumber(Object.keys(toDosIdList));
            const newTodoContent = new TodoBuilder().addTitle().addDoneStatus(true).addDescription().generate()

            const postPayload = payloads.updatePayload(todosId,newTodoContent.title, newTodoContent.doneStatus,newTodoContent.description);
            const response = await api.put(endpoints.updateOrDeleteById(todosId),postPayload)
            const responseBody = await response.json();

            expect(response.status).toBe(200);
            expect(responseBody.description).toBe(newTodoContent.description);

        });

    test('PUT /todos/{id} partial (200)',
        {tag: '@put'},
        async () => {
            let todosId = getRandomNumber(Object.keys(toDosIdList));
            const newTodoTitle = new TodoBuilder().addTitle().generate().title

            const postPayload = payloads.updateTitlePayload(newTodoTitle);
            const response = await api.put(endpoints.updateOrDeleteById(todosId),postPayload)
            const responseBody = await response.json();

            expect(response.status).toBe(200);
            expect(responseBody.title).toBe(newTodoTitle);
        });

    test('PUT /todos/{id} no title (400)',
        {tag: '@put'},
        async () => {
            let todosId = getRandomNumber(Object.keys(toDosIdList));
            let todoWithId = new TodoBuilder().addDoneStatus(false).addDescription().generate()
            const postPayload = payloads.updateNoTitlePayload(todoWithId.doneStatus, todoWithId.description);
            const response = await api.put(endpoints.updateOrDeleteById(todosId), postPayload);

            expect(response.status).toBe(400);
        });

    test('PUT /todos/{id} no amend id (400)',
        {tag: '@put'},
        async () => {
            let todosId = getRandomNumberNotContainedInArray(Object.keys(toDosIdList));
            let updateContent = new TodoBuilder().addTitle().addDoneStatus(false).addDescription().generate()
            const postPayload = payloads.updatePayload(todosId, updateContent.title,updateContent.doneStatus, updateContent.description);
            const response = await api.put(endpoints.updateOrDeleteById(todosId), postPayload);

            expect(response.status).toBe(400);
        });

    test('DELETE /todos/{id} (200)',
        {tag: '@delete'},
        async () => {
            const postPayload = payloads.newToDoPayload(newTodo.title,newTodo.doneStatus, newTodo.description);
            const createdTodoResponse = await api.post(endpoints.getAllToDo, postPayload);
            const newTodoId = (await createdTodoResponse.json()).id;

            const response = await api.delete(endpoints.updateOrDeleteById(newTodoId));
            expect(response.status).toBe(200)
        });

    test('OPTIONS /todos (200)',
        {tag: '@options'},
        async () => {
            const response = await api.options(endpoints.getAllToDo);

            expect(response.status).toBe(200);
            expect(response.headers.get('allow')).toBe("OPTIONS, GET, HEAD, POST");
        });
})

