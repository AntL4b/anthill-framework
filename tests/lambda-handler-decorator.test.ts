import {
  AHAwsContext,
  AHException,
  Anthill,
  LambdaController,
  LambdaHandler,
  anthill,
} from "../packages";
import { AHTestResource } from "./resources/test-resource";

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
    class AHTest {
      @LambdaHandler()
      async listTest(event: any, context?: AHAwsContext): Promise<string> {
        return "OK";
      }

      @LambdaHandler()
      static async listTest2(event: any, context?: AHAwsContext): Promise<string> {
        return "OK2";
      }
    }

    const app = anthill();
    app.configure({
      controllers: [AHTest],
    });

    const handlers = app.exposeHandlers();

    expect(Object.keys(handlers).includes("listTest")).toBe(true);
    expect(Object.keys(handlers).includes("listTest2")).toBe(true);

    const res = await handlers.listTest(null, AHTestResource.getBaseContext());
    const res2 = await handlers.listTest2(null, AHTestResource.getBaseContext());

    expect(res).toEqual("OK");
    expect(res2).toEqual("OK2");
  });

  test("decorator without contoller", async () => {
    class AHTest {
      @LambdaHandler()
      async listTest(event: any, context?: AHAwsContext): Promise<string> {
        return "OK";
      }
    }

    const app = anthill();
    app.configure({
      controllers: [AHTest],
    });

    const handlers = app.exposeHandlers();
    expect(Object.keys(handlers).includes("listTest")).toBe(false);

    const handler = Anthill.getInstance()["handlers"].find(h => h.getName() === "listTest");
    const res = handler.handleRequest(null, AHTestResource.getBaseContext());

    expect(res).rejects.toThrow(AHException);
  });
});
