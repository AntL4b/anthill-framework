import {
  AHAwsContext,
  AHAwsEvent,
  AHException,
  AHHttpResponse,
  AHPromiseHelper,
  AHRestMethodEnum,
  Anthill,
  RestController,
  RestHandler,
  anthill,
} from "../packages";
import { AHTestResource } from "./resources/test-resource";

describe("RestHandler decorator", () => {
  beforeEach(() => {
    Anthill["instance"] = null;
  });

  test("decorator add handler to anthill", async () => {
    @RestController({
      options: {
        displayPerformanceMetrics: false,
      },
    })
    class AHTest {
      @RestHandler({ method: AHRestMethodEnum.Get })
      async listTest(event: AHAwsEvent, context?: AHAwsContext): Promise<AHHttpResponse> {
        return AHPromiseHelper.promisify(AHHttpResponse.success(null));
      }

      @RestHandler({ method: AHRestMethodEnum.Get })
      static async listTest2(event: AHAwsEvent, context?: AHAwsContext): Promise<AHHttpResponse> {
        return AHPromiseHelper.promisify(AHHttpResponse.success(null));
      }
    }

    const app = anthill();
    const handlers = app.exposeHandlers();

    expect(Object.keys(handlers).includes("listTest")).toBe(true);
    expect(Object.keys(handlers).includes("listTest2")).toBe(true);

    const res = await handlers.listTest(AHTestResource.getBaseEvent(), AHTestResource.getBaseContext());
    const res2 = await handlers.listTest(AHTestResource.getBaseEvent(), AHTestResource.getBaseContext());

    expect(res).toBeInstanceOf(AHHttpResponse);
    expect(res2).toBeInstanceOf(AHHttpResponse);
  });

  test("decorator missing mandatory param", () => {
    expect(() => {
      @RestController({})
      class AHTest2 {
        @RestHandler({})
        async listTest(event: AHAwsEvent, context: string): Promise<AHHttpResponse> {
          return AHPromiseHelper.promisify(AHHttpResponse.success(null));
        }
      }
    }).toThrow(AHException);
  });

  test("decorator without contoller", async () => {
    class AHTest {
      @RestHandler({ method: AHRestMethodEnum.Get })
      async listTest(event: AHAwsEvent, context?: AHAwsContext): Promise<AHHttpResponse> {
        return AHPromiseHelper.promisify(AHHttpResponse.success(null));
      }
    }

    const app = anthill();
    const handlers = app.exposeHandlers();

    expect(Object.keys(handlers).includes("listTest")).toBe(true);

    // Should throw a managed error (i.e. 400 response code)
    const res = await handlers.listTest(AHTestResource.getBaseEvent(), AHTestResource.getBaseContext());
    expect(res).toBeInstanceOf(AHHttpResponse);
    expect(res.statusCode).toEqual(400);
  });
});
