import { AHAwsContext, AHAwsEvent, AHException, AHHttpResponse, AHPromiseHelper, AHRestMethodEnum, Anthill, RestHandler, anthill } from "..";
import { AHTestResource } from "./resources/test-resource";

describe('RestHandler decorator', () => {
  beforeEach(() => {
    Anthill["instance"] = null;
  });

  test('decorator add handler to anthill', () => {
    class AHTest {
      @RestHandler({ method: AHRestMethodEnum.Get })
      async listTest(event: AHAwsEvent, context?: AHAwsContext): Promise<AHHttpResponse> {
        return AHPromiseHelper.promisify(AHHttpResponse.success(null))
      }
    }

    new AHTest();
    const app = anthill();
    const handlers = app.exposeHandlers();

    expect(Object.keys(handlers).includes("listTest")).toBe(true);
    expect(handlers.listTest(AHTestResource.getBaseEvent(), AHTestResource.getBaseContext())).resolves.toBeInstanceOf(AHHttpResponse);
  });

  test('decorator missing mandatory param', () => {
    expect(() => {
      class AHTest {
        @RestHandler({})
        async listTest(event: AHAwsEvent, context: AHAwsContext): Promise<AHHttpResponse> {
          return AHPromiseHelper.promisify(AHHttpResponse.success(null))
        }
      }
      new AHTest();
    }).toThrow(AHException);
  });
});
