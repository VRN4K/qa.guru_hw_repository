import endpoints from "../services/endpoints";
import payloads from "../services/payloads";

export class TodosController {
    constructor(api) {
        this.api = api;
    }

    async getAllTodos() {
        return await this.api.get(endpoints.getAllToDo);
    }

    async getTodoById(todoId) {
        return await this.api.get(endpoints.getToDoById(todoId))
    }

    async getDoneTodos() {
        return await this.api.get(endpoints.getFilteredTodoByDoneStatus);
    }

    async getTodosHeaders() {
        return await this.api.head(endpoints.getAllToDo);
    }

    async postTodo(payload) {
        return await this.api.post(endpoints.getAllToDo, payload);
    }

    async postTodoById(id, payload) {
        return await this.api.post(endpoints.updateOrDeleteById(id), payload)
    }

    async putTodo(id, payload) {
        return await this.api.put(endpoints.getToDoById(id), payload);
    }

    async deleteTodosById(id) {
        return await this.api.delete(endpoints.updateOrDeleteById(id));
    }

    async getTodosWithAccept(accept) {
        return await this.api.get(endpoints.getAllToDo, accept || '');
    }

    async postTodosJsonToXml(payload) {
        return await this.api.post(endpoints.getAllToDo, payload, 'application/json', 'application/xml');
    }

    async postTodosXmlToJson(payload) {
        return await this.api.post(endpoints.getAllToDo, payload, 'application/xml', 'application/json');
    }

    async postTodosXmlToXml(payload) {
        return await this.api.post(endpoints.getAllToDo, payload, 'application/xml', 'application/xml');
    }

    async postTodosJsonToJson(payload) {
        return await this.api.post(endpoints.getAllToDo, payload, 'application/json', 'application/json');
    }

    async postTodosWrongContentType(payload) {
        return await this.api.post(endpoints.getAllToDo, payload, 'application/json', 'test');
    }

    async optionsTodos() {
        return await this.api.options(endpoints.getAllToDo);
    }
}