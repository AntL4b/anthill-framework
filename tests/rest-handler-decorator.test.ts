import {
  AwsContext,
  AwsEvent,
  AnthillException,
  HttpResponse,
  PromiseHelper,
  RestMethodEnum,
  Anthill,
  RestController,
  RestHandler,
  anthill,
} from "../packages";
import { TestResource } from "./resources/test-resource";

describe("RestHandler decorator", () => {
  beforeEach(() => {
    Anthill["instance"] = null;
  });

  test("decorator add handler to anthill", async () => {
    @RestController()
    class Test {
      @RestHandler({ method: RestMethodEnum.Get })
      async listTest(event: AwsEvent, context?: AwsContext): Promise<HttpResponse> {
        return PromiseHelper.promisify(HttpResponse.success(null));
      }

      @RestHandler({ method: RestMethodEnum.Get })
      static async listTest2(event: AwsEvent, context?: AwsContext): Promise<HttpResponse> {
        return PromiseHelper.promisify(HttpResponse.success(null));
      }
    }

    const app = anthill();
    app.configure({
      controllers: [Test],
    });

    const handlers = app.exposeHandlers();

    expect(Object.keys(handlers).includes("listTest")).toBe(true);
    expect(Object.keys(handlers).includes("listTest2")).toBe(true);

    const res = await handlers.listTest(TestResource.getBaseEvent(), TestResource.getBaseContext());
    const res2 = await handlers.listTest2(TestResource.getBaseEvent(), TestResource.getBaseContext());

    expect(res).toBeInstanceOf(HttpResponse);
    expect(res2).toBeInstanceOf(HttpResponse);
  });

  test("decorator missing mandatory param", () => {
    expect(() => {
      @RestController()
      class Test2 {
        @RestHandler({} as any)
        async listTest(event: AwsEvent, context: string): Promise<HttpResponse> {
          return PromiseHelper.promisify(HttpResponse.success(null));
        }
      }
    }).toThrow(AnthillException);
  });

  test("decorator without contoller", async () => {
    class Test {
      @RestHandler({ method: RestMethodEnum.Get })
      async listTest(event: AwsEvent, context?: AwsContext): Promise<HttpResponse> {
        return PromiseHelper.promisify(HttpResponse.success(null));
      }
    }

    const app = anthill();
    app.configure({
      controllers: [Test],
    });

    const handlers = app.exposeHandlers();
    expect(Object.keys(handlers).includes("listTest")).toBe(false);

    const handler = Anthill.getInstance()["handlers"].find(h => h.getName() === "listTest");

    // Should throw a managed error (i.e. 400 response code)
    const res = await handler.handleRequest(TestResource.getBaseEvent(), TestResource.getBaseContext());
    expect(res).toBeInstanceOf(HttpResponse);
    expect(res.statusCode).toEqual(400);
  });
});
