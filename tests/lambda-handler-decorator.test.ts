import {
  AwsContext,
  AnthillException,
  Anthill,
  LambdaController,
  LambdaHandler,
  anthill,
} from "../packages";
import { TestResource } from "./resources/test-resource";

describe("LambdaHandler decorator", () => {
  beforeEach(() => {
    Anthill["instance"] = null;
  });

  test("decorator add handler to anthill", async () => {
    @LambdaController({
      options: {
        displayPerformanceMetrics: false,
      },
    })
    class Test {
      @LambdaHandler()
      async listTest(event: any, context?: AwsContext): Promise<string> {
        return "OK";
      }

      @LambdaHandler()
      static async listTest2(event: any, context?: AwsContext): Promise<string> {
        return "OK2";
      }
    }

    const app = anthill();
    app.configure({
      controllers: [Test],
    });

    const handlers = app.exposeHandlers();

    expect(Object.keys(handlers).includes("listTest")).toBe(true);
    expect(Object.keys(handlers).includes("listTest2")).toBe(true);

    const res = await handlers.listTest(null, TestResource.getBaseContext());
    const res2 = await handlers.listTest2(null, TestResource.getBaseContext());

    expect(res).toEqual("OK");
    expect(res2).toEqual("OK2");
  });

  test("decorator without contoller", async () => {
    class Test {
      @LambdaHandler()
      async listTest(event: any, context?: AwsContext): Promise<string> {
        return "OK";
      }
    }

    const app = anthill();
    app.configure({
      controllers: [Test],
    });

    const handlers = app.exposeHandlers();
    expect(Object.keys(handlers).includes("listTest")).toBe(false);

    const handler = Anthill.getInstance()["handlers"].find(h => h.getName() === "listTest");
    const res = handler.handleRequest(null, TestResource.getBaseContext());

    expect(res).rejects.toThrow(AnthillException);
  });
});
