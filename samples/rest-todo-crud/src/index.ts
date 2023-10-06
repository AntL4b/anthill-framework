import { anthill } from "@antl4b/anthill-framework";
import { TodoController } from "./controllers/todo-controller";

const app = anthill();

app.configure({
  controllers: [TodoController],
  options: {
    displayPerformanceMetrics: true
  }
});

const handlers = app.exposeHandlers();

exports.createTodo = handlers.createTodo;
exports.listTodos = handlers.listTodos;
exports.getTodo = handlers.getTodo;
exports.deleteTodo = handlers.deleteTodo;
