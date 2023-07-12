import { AHException, AHRestHandler, Anthill, anthill } from "..";
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
    app.registerRestHandler(AHTestResource.getDefaultHandler());
    expect(Anthill["restHandlers"].length).toBe(restHandlerNumber + 1);
    expect(() => app.registerRestHandler(AHTestResource.getDefaultHandler())).toThrow(AHException);
  });

  test('registerRestHandler', () => {
    const app = anthill();
    app.registerRestHandler(AHTestResource.getDefaultHandler({
      name: "restHandler",
    }));
    exports = app.exposeHandlers();
    expect(exports.restHandler).toBeInstanceOf(AHRestHandler);
  });
});
