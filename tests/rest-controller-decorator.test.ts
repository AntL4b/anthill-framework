import { AHObjectHelper, Anthill, RestController, anthill } from "../packages";
import { AHRestControllerClass } from "../packages/core/models/rest-controller-class";

describe("RestController decorator", () => {
  beforeEach(() => {
    Anthill["instance"] = null;
  });

  test("RestController decorator without params", async () => {
    @RestController()
    class AHTest {}

    const app = anthill();
    app.configure({
      controllers: [AHTest]
    });

    expect(Object.keys(app["_dependencyContainer"]["container"]).includes("AHTest")).toEqual(true);
  });

  test("RestController decorator with params", async () => {
    @RestController({
      middlewares: [],
      cacheConfig: {
        cacheable: true,
      },
    })
    class AHTest {}

    const app = anthill();
    app.configure({
      controllers: [AHTest]
    });

    const controllerInstance = app["_dependencyContainer"].resolve<InstanceType<AHRestControllerClass>>("AHTest");

    expect(AHObjectHelper.isEquivalentObj(controllerInstance._restHandlerConfig, {
      middlewares: [],
      cacheConfig: {
        cacheable: true,
      },
    })).toEqual(true);
  });
});
