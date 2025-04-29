import {test, expect} from '@playwright/test';
import {ChallengesApi} from "../src/services/index";
import {getRandomGUID, getRandomNumber, getRandomNumberNotContainedInArray} from "../src/index";
import {TodoBuilder} from "../src/builders/todo.builder";
import payloads from "../src/services/payloads";
import endpoints from "../src/services/endpoints";
import {ChallengesController, TodosController} from "../src/controllers/index";

const URL = 'https://apichallenges.herokuapp.com/';


test.describe('API challenge', () => {
    let api = new ChallengesApi(URL);
    let challengesController = new ChallengesController(api);
    let todosController = new TodosController(api);

    let toDosIdList = [];
    let newTodo = new TodoBuilder().addTitle().addDoneStatus(true).addDescription().generate()

    test.beforeAll(async () => {
        await challengesController.createChallenger();

        let response = await todosController.getAllTodos();
        (await response.json()).todos.forEach((element) => toDosIdList[element.id] = element.title);
    });

    test("Получить список заданий get /challenges",
        {tag: '@get'},
        async () => {
            const response = await challengesController.getAllChallenges()

            expect(response.status).toBe(200);
            expect((await response.json()).challenges.length).toBe(59);
        });

    test('Получить список ToDo get /todos (200)',
        {tag: '@get'},
        async () => {
            const response = await todosController.getAllTodos()
            const body = (await response.json()).todos;

            expect(response.status).toBe(200);
            expect(body.length).toBe(10);
        });

    test('Получить ошибку необходимости множественного числа get /todo (404) not plural',
        {tag: '@get'},
        async () => {
            const response = await challengesController.getChallengesNotPlural();

            expect(response.status).toBe(404);
        });

    test('Получить ToDo по id get /todos/{id} (200)',
        {tag: '@get'},
        async () => {
            let todoId = getRandomNumber(Object.keys(toDosIdList));
            const response = await todosController.getTodoById(todoId);

            expect(response.status).toBe(200);
            expect(toDosIdList[`'${todoId}'`]).toBe((await response.json()).id);
        });

    test('Получить ToDo по не существующему id get /todos/{id} (404)',
        {tag: '@get'},
        async () => {
            const todoId = getRandomNumberNotContainedInArray(toDosIdList.length)
            const response = await todosController.getTodoById(todoId);

            expect(response.status).toBe(404);
        });

    test('Отфильтровать ToDo по статусу GET /todos (200) ?filter',
        {tag: '@get'},
        async () => {
            const postPayload = payloads.newToDoPayload(newTodo.title,true, newTodo.description);
            await todosController.postTodo(postPayload);


            const response = await todosController.getDoneTodos()
            const responseBody = await response.json();

            expect(response.status).toBe(200);
            responseBody.todos.forEach((element) => expect(element.doneStatus).toBe(true));
        });

    test('Получить заголовки head /todos (200)',
        {tag: '@head'},
        async () => {
            const response = await todosController.getTodosHeaders();

            expect(response.status).toBe(200);
        });

    test('Создать новый ToDo post /todos (201)',
        {tag: '@post'},
        async () => {
            const postPayload = payloads.newToDoPayload(newTodo.title, newTodo.doneStatus, newTodo.description);
            const response = await todosController.postTodo(postPayload)
            const todo = await response.json();

            expect(response.status).toBe(201);
            expect(newTodo.title).toBe(todo.title);
            expect(newTodo.doneStatus).toBe(todo.doneStatus);
            expect(newTodo.description).toBe(todo.description);
        });

    test('Ошибка валидации статуса при создании ToDo POST /todos (400) doneStatus',
        {tag: '@post'},
        async () => {
            let wrongStatusTodo = new TodoBuilder().addTitle().addDoneStatus('test').addDescription().generate()
            const postPayload = payloads.wrongToDoStatusPayload(wrongStatusTodo.title, wrongStatusTodo.doneStatus, wrongStatusTodo.description);

            const response = await todosController.postTodo(postPayload);
            expect(response.status).toBe(400);
        });

    test('Ошибка валидации наименования при создании ToDo POST /todos (400) title too long',
        {tag: '@post'},
        async () => {
            let longTitleTodo = new TodoBuilder().addTitle(100).addDoneStatus(false).addDescription().generate()
            const postPayload = payloads.newToDoPayload(longTitleTodo.title, longTitleTodo.doneStatus, longTitleTodo.description);

            const response = await todosController.postTodo(postPayload);
            expect(response.status).toBe(400);
        });

    test('Ошибка валидации описания при создании ToDo POST /todos (400) description too long',
        {tag: '@post'},
        async () => {
            let longDescriptionTodo = new TodoBuilder().addTitle().addDoneStatus(false).addDescription(500).generate()
            const postPayload = payloads.newToDoPayload(longDescriptionTodo.title, longDescriptionTodo.doneStatus, longDescriptionTodo.description);

            const response = await todosController.postTodo(postPayload);
            expect(response.status).toBe(400);
        });

    test('Создать новый ToDo с максимальной длиной наименования и описания POST /todos (201) max out content',
        {tag: '@post'},
        async () => {
            let maxOutTodo = new TodoBuilder().addTitleBySymbols(50).addDoneStatus(false)
                .addDescriptionBySymbols(200).generate()
            const postPayload = payloads.newToDoPayload(maxOutTodo.title, maxOutTodo.doneStatus, maxOutTodo.description);

            const response = await todosController.postTodo(postPayload);
            const responseBody = await response.json();

            expect(response.status).toBe(201);
            expect(responseBody.title).toBe(maxOutTodo.title);
            expect(responseBody.title.length).toBe(50);
            expect(responseBody.description).toBe(maxOutTodo.description);
            expect(responseBody.description.length).toBe(200);
            //может ломать другие тесты из-за недопустимых символов (из-за нехватки вермени пока приходится удалять)
            await api.delete(endpoints.updateOrDeleteById(responseBody.id))
        });

    test('Ошибка привышения допустимого размера тела запроса POST /todos (413) content too long',
        {tag: '@post'},
        async () => {
            let longContentTodo = new TodoBuilder().addTitle(1000).addDoneStatus(false)
                .addDescription(1000).generate()
            const postPayload = payloads.newToDoPayload(longContentTodo.title, longContentTodo.doneStatus, longContentTodo.description);

            const response = await todosController.postTodo(postPayload);
            expect(response.status).toBe(413);
        });

    test('Ошибка наличия неопределенного поля в теле запроса POST /todos (400) extra',
        {tag: '@post'},
        async () => {
            const postPayload = payloads.unrecognisedFieldPayload(newTodo.title, newTodo.doneStatus, newTodo.description);
            const response = await todosController.postTodo(postPayload);

            expect(response.status).toBe(400);
        });

    test('Ошибка создания ToDo PUT /todos/{id} (400)',
        {tag: '@put'},
        async () => {
            let todoWithId = new TodoBuilder().addId(45).addTitle().addDoneStatus(false).addDescription().generate()
            const postPayload = payloads.newToDoPayload(todoWithId.title, todoWithId.doneStatus, todoWithId.description);
            const response = await todosController.putTodo(todoWithId.id,postPayload);

            expect(response.status).toBe(400);
        });

    test('Обновить ToDo по id  POST /todos/{id} (200)',
        {tag: '@post'},
        async () => {
            let todosId = getRandomNumber(Object.keys(toDosIdList));
            const newDescription = new TodoBuilder().addDescription().generate().description;

            const postPayload = payloads.updateDescriptionPayload(newDescription);
            const response = await todosController.postTodoById(todosId , postPayload);
            const responseBody = await response.json();

            expect(response.status).toBe(200);
            expect(responseBody.description).toBe(newDescription);
        });

    test('Ошибка обновления несуществующего ToDo по id  POST /todos/{id} (404)',
        {tag: '@post'},
        async () => {
            let todosId = getRandomNumberNotContainedInArray(Object.keys(toDosIdList));
            const newDescription = new TodoBuilder().addDescription().generate().description;

            const postPayload = payloads.updateDescriptionPayload(newDescription);
            const response = await todosController.postTodoById(todosId, postPayload);

            expect(response.status).toBe(404);
        });

    test('Обновить все поля ToDo PUT /todos/{id} full (200)',
        {tag: '@put'},
        async () => {
            let todosId = getRandomNumber(Object.keys(toDosIdList));
            const newTodoContent = new TodoBuilder().addTitle().addDoneStatus(true).addDescription().generate()

            const postPayload = payloads.updatePayload(todosId, newTodoContent.title, newTodoContent.doneStatus, newTodoContent.description);
            const response = await todosController.putTodo(todosId, postPayload);
            const responseBody = await response.json();

            expect(response.status).toBe(200);
            expect(responseBody.description).toBe(newTodoContent.description);

        });

    test('Обновить одно поле ToDo PUT /todos/{id} partial (200)',
        {tag: '@put'},
        async () => {
            let todosId = getRandomNumber(Object.keys(toDosIdList));
            const newTodoTitle = new TodoBuilder().addTitle().generate().title

            const postPayload = payloads.updateTitlePayload(newTodoTitle);
            const response = await todosController.putTodo(todosId, postPayload);
            const responseBody = await response.json();

            expect(response.status).toBe(200);
            expect(responseBody.title).toBe(newTodoTitle);
        });

    test('Ошибка обновления ToDo с отсутсувующим полем наименования PUT /todos/{id} no title (400)',
        {tag: '@put'},
        async () => {
            let todosId = getRandomNumber(Object.keys(toDosIdList));
            let todoWithId = new TodoBuilder().addDoneStatus(false).addDescription().generate()
            const postPayload = payloads.updateNoTitlePayload(todoWithId.doneStatus, todoWithId.description);
            const response = await todosController.putTodo(todosId, postPayload);

            expect(response.status).toBe(400);
        });

    test('Ошибка обновления ToDo с разными id в теле и в url PUT /todos/{id} no amend id (400)',
        {tag: '@put'},
        async () => {
            const todosId = getRandomNumber(Object.keys(toDosIdList));
            const differentId = todosId + 1;
            let updateContent = new TodoBuilder().addTitle().addDoneStatus(false).addDescription().generate()
            const postPayload = payloads.updatePayload(differentId, updateContent.title, updateContent.doneStatus, updateContent.description);
            const response = await todosController.putTodo(todosId, postPayload);

            expect(response.status).toBe(400);
        });

    test('Удалить ToDo по id DELETE /todos/{id} (200)',
        {tag: '@delete'},
        async () => {
            const postPayload = payloads.newToDoPayload(newTodo.title, newTodo.doneStatus, newTodo.description);
            const createdTodoResponse = await todosController.postTodo(postPayload);
            const newTodoId = (await createdTodoResponse.json()).id;

            const response = await todosController.deleteTodosById(newTodoId, postPayload);
            expect(response.status).toBe(200)
        });

    test('Проверить заголовок Allow OPTIONS /todos (200)',
        {tag: '@options'},
        async () => {
            const response = await todosController.optionsTodos();

            expect(response.status).toBe(200);
            expect(response.headers.get('allow')).toBe("OPTIONS, GET, HEAD, POST");
        });

    test('Получить список всех ToDo в формате XML GET /todos (200) XML',
        {tag: '@get'},
        async () => {
            const response = await todosController.getTodosWithAccept('application/xml');

            expect(response.status).toBe(200);
        });

    test('Получить список всех ToDo в формате JSON GET /todos (200) JSON',
        {tag: '@get'},
        async () => {
            const response = await todosController.getTodosWithAccept('application/json');

            expect(response.status).toBe(200);
        });

    test('Получить список всех ToDo в формате по умолчанию(JSON) GET /todos (200) ANY',
        {tag: '@get'},
        async () => {
            const response = await todosController.getTodosWithAccept('*/*');

            expect(response.status).toBe(200);
        });

    test('Получить список всех ToDo с приоритетом в формате XML GET /todos (200) XML pref',
        {tag: '@get'},
        async () => {
            const response = await todosController.getTodosWithAccept('application/xml, application/json');

            expect(response.status).toBe(200);
        });

    test('Получить список всех ToDo без указания заголовка Accept GET /todos (200) no accept',
        {tag: '@get'},
        async () => {
            const response = await todosController.getTodosWithAccept();

            expect(response.status).toBe(200);
        });

    test('Ошибка получения списка всех ToDo в формате gzip GET /todos (406)',
        {tag: '@get'},
        async () => {
            const response = await todosController.getTodosWithAccept('application/gzip');

            expect(response.status).toBe(406);
        });

    test('Создать новый ToDo с телом в формате XML POST /todos XML',
        {tag: '@post'},
        async () => {
            const postPayload = payloads.newToDoPayloadXml(newTodo.title, newTodo.doneStatus, newTodo.description);
            const response = await todosController.postTodosXmlToXml(postPayload)

            expect(response.status).toBe(201);
        });

    test('Создать новый ToDo с телом в формате JSON POST /todos JSON',
        {tag: '@post'},
        async () => {
            const postPayload = payloads.newToDoPayload(newTodo.title, newTodo.doneStatus, newTodo.description)
            const response = await todosController.postTodosJsonToJson(postPayload);

            expect(response.status).toBe(201);
        });

    test('Ошибка создания ToDo с неизвестным типом заголовка content-type POST /todos (415)',
        {tag: '@post'},
        async () => {
        const postPayload = payloads.newToDoPayload(newTodo.title, newTodo.doneStatus, newTodo.description);
        const response = await todosController.postTodosWrongContentType(postPayload);

            expect(response.status).toBe(415);
        });

    test('Поулчить прогресс пользователя по заданиям GET /challenger/guid (existing X-CHALLENGER)',
        {tag: '@get'},
        async () => {
            const response = await challengesController.getChallengerProgress();

            expect(response.status).toBe(200);
        });

    test('Восстановить прогресс пользователя PUT /challenger/guid RESTORE)',
        {tag: '@put'},
        async () => {
            let response = await challengesController.getChallengerProgress()
            let challengerProgressPayload = await response.json();

            response = await challengesController.restoreChallengerProgress(challengerProgressPayload);

            expect(response.status).toBe(200);
        });

    test('Создание нового пользователя с прогрессом PUT /challenger/guid CREATE',
        {tag: '@put'},
        async () => {
            let response = await challengesController.getChallengerProgress()
            let challengerProgressPayload = await response.json();
            let newChallengerID= getRandomGUID();
            challengerProgressPayload.xChallenger = newChallengerID;

            response = await challengesController.putChallengerWithProgress(newChallengerID, challengerProgressPayload);
            expect(response.status).toBe(201);
        });

    test('Получить список ToDo текущей сессии из базы GET /challenger/database/guid (200)',
        {tag: '@get'},
        async () => {
            let response = await challengesController.getChallengerTodosDatabase()

            expect(response.status).toBe(200);
            expect(await response.json()).toHaveProperty("todos");
        });

    test('Обновить/заполнить список ToDo текущей сессии в базе PUT /challenger/database/guid (Update)',
        {tag: '@put'},
        async () => {
            let response = await challengesController.getChallengerTodosDatabase();
            let restoreData = await response.json();
            response = await challengesController.putChallengesToDatabase(restoreData);

            expect(response.status).toBe(204);
        });

    test('Создать ToDo с заголовками Content-Type(application/xml) и Accept(application/json) POST /todos XML to JSON',
        {tag: '@post'},
        async () => {
        const postPayload = payloads.newToDoPayload(newTodo.title, newTodo.doneStatus, newTodo.description);
            const response = await todosController.postTodosXmlToJson(postPayload);

            expect(response.status).toBe(201);
        });

    test('Создать ToDo с заголовками Content-Type(application/json) и Accept(application/xml) Создать POST /todos JSON to XML',
        {tag: '@post'},
        async () => {
            const postPayload = payloads.newToDoPayloadXml(newTodo.title, newTodo.doneStatus, newTodo.description);
            const response = await todosController.postTodosJsonToXml(postPayload);

            expect(response.status).toBe(201);
        });
})

