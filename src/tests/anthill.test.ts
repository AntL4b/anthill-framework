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

  test('registerHandler', () => {
    const handlerNumber = Anthill["handlers"].length;
    const app = anthill();
    app.registerHandler(AHTestResource.getDefaultRestHandler());

    expect(Anthill["handlers"].length).toEqual(handlerNumber + 1);
    expect(() => app.registerHandler(AHTestResource.getDefaultRestHandler())).toThrow(AHException);
  });

  test('exposeHandlers', () => {
    const app = anthill();
    app.registerHandler(AHTestResource.getDefaultRestHandler({
      name: "restHandler",
    }));
    exports = app.exposeHandlers();
    expect(exports.restHandler(AHTestResource.getBaseEvent(), AHTestResource.getBaseContext())).resolves.toBeTruthy();
  });
});
