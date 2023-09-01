import { AHException, Anthill, anthill } from "..";
import { AHTestResource } from "./resources/test-resource";


describe('Anthill', () => {
  beforeEach(() => {
    Anthill["instance"] = null;
  });

  test('constructor', () => {
    const app = anthill();
    expect(app).toBeInstanceOf(Anthill);
  });

  test('registerRestHandler', () => {
    const restHandlerNumber = Anthill["restHandlers"].length;
    const app = anthill();
    app.registerRestHandler(AHTestResource.getDefaultRestHandler());
    expect(Anthill["restHandlers"].length).toBe(restHandlerNumber + 1);
    expect(() => app.registerRestHandler(AHTestResource.getDefaultRestHandler())).toThrow(AHException);
  });

  test('registerLambdaHandler', () => {
    const restHandlerNumber = Anthill["lambdaHandlers"].length;
    const app = anthill();
    app.registerLambdaHandler(AHTestResource.getDefaultLambdaHandler());
    expect(Anthill["lambdaHandlers"].length).toBe(restHandlerNumber + 1);
    expect(() => app.registerLambdaHandler(AHTestResource.getDefaultLambdaHandler())).toThrow(AHException);
  });

  test('exposeHandlers', () => {
    const app = anthill();
    app.registerRestHandler(AHTestResource.getDefaultRestHandler({
      name: "restHandler",
    }));
    exports = app.exposeHandlers();
    expect(exports.restHandler(AHTestResource.getBaseEvent(), AHTestResource.getBaseContext())).resolves.toBeTruthy();
  });
});
