import fs from "fs";

export class TodoService {
  /**
   * Read todo file and return todo list
   * @returns The list of todos
   */
  static readTodos(): Array<{ id: number; value: string }> {
    try {
      const todoFile = fs.readFileSync("./data/todos.json", "utf-8");
      return JSON.parse(todoFile);
    } catch (error) {
      // File doesn't exist yet, create it
      fs.writeFileSync("./data/todos.json", JSON.stringify([], null, 2), "utf-8");
    }

    return [];
  }

  /**
   * Write given todo list to the todo file
   * @param todos The todo list to write to the todo file
   */
  static writeTodos(todos: Array<{ id: number; value: string }>): void {
    fs.writeFileSync("./data/todos.json", JSON.stringify(todos, null, 2), "utf-8");
  }
}
