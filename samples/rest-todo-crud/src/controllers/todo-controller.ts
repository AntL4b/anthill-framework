import {
  AwsEvent,
  AnthillException,
  HttpResponse,
  HttpResponseBodyStatusEnum,
  JsonBodyParserMiddleware,
  RestMethodEnum,
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
    method: RestMethodEnum.Post,
    middlewares: [new JsonBodyParserMiddleware()],
  })
  createTodo(event: AwsEvent): HttpResponse {
    // Get parsed body data
    const body = event.body;

    if (!body.value) {
      throw new AnthillException("Todo value not found in body");
    }

    const todos = TodoService.readTodos();

    const todo = {
      id: todos.length ? Math.max(...todos.map((t) => t.id)) + 1 : 1,
      value: body.value,
    };

    todos.push(todo);
    TodoService.writeTodos(todos);

    return HttpResponse.success({
      status: HttpResponseBodyStatusEnum.Success,
      payload: todo,
    });
  }

  /**
   * List the todos
   * @param event AWS event
   * @returns The list of todo
   */
  @RestHandler({ method: RestMethodEnum.Get })
  listTodos(event: AwsEvent): HttpResponse {
    const todos = TodoService.readTodos();

    return HttpResponse.success({
      status: HttpResponseBodyStatusEnum.Success,
      payload: todos,
    });
  }

  /**
   * Get a single todo identified with his id
   * @param event AWS event
   * @returns The requested todo
   */
  @RestHandler({ method: RestMethodEnum.Get })
  getTodo(event: AwsEvent): HttpResponse {
    const id = parseInt(event.pathParameters.id);
    const todos = TodoService.readTodos();
    const todo = todos.find((t) => t.id === id);

    if (todo) {
      return HttpResponse.success({
        status: HttpResponseBodyStatusEnum.Success,
        payload: todo,
      });
    } else {
      return HttpResponse.notFound({
        status: HttpResponseBodyStatusEnum.NotFound,
        message: `Todo with id ${id} not found :/`,
      });
    }
  }

  /**
   * Remove todo identified with his id
   * @param event AWS event
   * @returns The deleted todo
   */
  @RestHandler({ method: RestMethodEnum.Delete })
  deleteTodo(event: AwsEvent): HttpResponse {
    const id = parseInt(event.pathParameters.id);
    const todos = TodoService.readTodos();
    const todoIndex = todos.findIndex((t) => t.id === id);

    if (todoIndex >= 0) {
      const todo = todos.splice(todoIndex, 1);
      TodoService.writeTodos(todos);

      return HttpResponse.success({
        status: HttpResponseBodyStatusEnum.Success,
        payload: todo,
      });
    } else {
      return HttpResponse.notFound({
        status: HttpResponseBodyStatusEnum.NotFound,
        message: `Todo with id ${id} not found :/`,
      });
    }
  }
}
