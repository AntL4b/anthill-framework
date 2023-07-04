import { AHException, Anthill, anthill } from "..";
import { AHTestResource } from "./resources/test-resource";


describe('Anthill', () => {
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
});
