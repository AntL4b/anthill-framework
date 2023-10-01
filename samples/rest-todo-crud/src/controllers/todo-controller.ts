import {
  AHAwsEvent,
  AHException,
  AHHttpResponse,
  AHHttpResponseBodyStatusEnum,
  AHJsonBodyParserMiddleware,
  AHRestMethodEnum,
  RestController,
  RestHandler,
} from "@antl4b/anthill-framework";
import { TodoService } from "../services/todo-service";

@RestController()
export class TodoController {
  /**
   * Create a todo
   * @param event AWS event
   * @returns The created todo
   */
  @RestHandler({
    method: AHRestMethodEnum.Post,
    middlewares: [new AHJsonBodyParserMiddleware()],
  })
  createTodo(event: AHAwsEvent): AHHttpResponse {
    // Get parsed body from middleware data
    const body = event.middlewareData.body;

    if (!body.value) {
      throw new AHException("Todo value not found in body");
    }

    const todos = TodoService.readTodos();

    const todo = {
      id: todos.length ? Math.max(...todos.map((t) => t.id)) + 1 : 1,
      value: body.value,
    };

    todos.push(todo);
    TodoService.writeTodos(todos);

    return AHHttpResponse.success({
      status: AHHttpResponseBodyStatusEnum.Success,
      payload: todo,
    });
  }

  /**
   * List the todos
   * @param event AWS event
   * @returns The list of todo
   */
  @RestHandler({ method: AHRestMethodEnum.Get })
  listTodos(event: AHAwsEvent): AHHttpResponse {
    const todos = TodoService.readTodos();

    return AHHttpResponse.success({
      status: AHHttpResponseBodyStatusEnum.Success,
      payload: todos,
    });
  }

  /**
   * Get a single todo identified with his id
   * @param event AWS event
   * @returns The requested todo
   */
  @RestHandler({ method: AHRestMethodEnum.Get })
  getTodo(event: AHAwsEvent): AHHttpResponse {
    const id = parseInt(event.pathParameters.id);
    const todos = TodoService.readTodos();
    const todo = todos.find((t) => t.id === id);

    if (todo) {
      return AHHttpResponse.success({
        status: AHHttpResponseBodyStatusEnum.Success,
        payload: todo,
      });
    } else {
      return AHHttpResponse.notFound({
        status: AHHttpResponseBodyStatusEnum.NotFound,
        message: `Todo with id ${id} not found :/`,
      });
    }
  }

  /**
   * Remove todo identified with his id
   * @param event AWS event
   * @returns The deleted todo
   */
  @RestHandler({ method: AHRestMethodEnum.Delete })
  deleteTodo(event: AHAwsEvent): AHHttpResponse {
    const id = parseInt(event.pathParameters.id);
    const todos = TodoService.readTodos();
    const todoIndex = todos.findIndex((t) => t.id === id);

    if (todoIndex >= 0) {
      const todo = todos.splice(todoIndex, 1);
      TodoService.writeTodos(todos);

      return AHHttpResponse.success({
        status: AHHttpResponseBodyStatusEnum.Success,
        payload: todo,
      });
    } else {
      return AHHttpResponse.notFound({
        status: AHHttpResponseBodyStatusEnum.NotFound,
        message: `Todo with id ${id} not found :/`,
      });
    }
  }
}
