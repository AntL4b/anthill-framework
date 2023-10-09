import { ObjectHelper, Anthill, RestController, anthill } from "../packages";
import { RestControllerClass } from "../packages/core/models/rest-controller-class";

describe("RestController decorator", () => {
  beforeEach(() => {
    Anthill["instance"] = null;
  });

  test("RestController decorator without params", async () => {
    @RestController()
    class Test {}

    const app = anthill();
    app.configure({
      controllers: [Test]
    });

    expect(Object.keys(app["_dependencyContainer"]["container"]).includes("Test")).toEqual(true);
  });

  test("RestController decorator with params", async () => {
    @RestController({
      middlewares: [],
      cacheConfig: {
        cacheable: true,
      },
    })
    class Test {}

    const app = anthill();
    app.configure({
      controllers: [Test]
    });

    const controllerInstance = app["_dependencyContainer"].resolve<InstanceType<RestControllerClass>>("Test");

    expect(ObjectHelper.isEquivalentObj(controllerInstance._restHandlerConfig, {
      middlewares: [],
      cacheConfig: {
        cacheable: true,
      },
    })).toEqual(true);
  });
});
