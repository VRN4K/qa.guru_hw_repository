export default {
    getToken:  "challenger",
    getAllChallenges: "challenges",
    getAllToDo: "todos",
    getToDoNotPlural: "todo",
    getToDoById: (id) => `todos/${id}`,
    updateOrDeleteById: (id) => `todos/${id}`,
    getFilteredTodoByDoneStatus: (doneStatus) => `todos?doneStatus=${doneStatus}`,
    checkTokenExisting: (guid) => `challenger/${guid}`,
    restoreCurrentTodos: (guid) => `challenger/database/${guid}`,
};
