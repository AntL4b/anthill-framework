import { AHObjectHelper, Anthill, RestController, anthill } from "..";
import { AHRestControllerClass } from "../core/models/controller-class/rest-controller-class";

describe("RestController decorator", () => {
  beforeEach(() => {
    Anthill["instance"] = null;
  });

  test("RestController decorator without params", async () => {
    @RestController()
    class AHTest {}

    const app = anthill();

    expect(Object.keys(app["_dependencyContainer"]["container"]).includes("AHTest")).toEqual(true);
  });

  test("RestController decorator with params", async () => {
    @RestController({
      middlewares: [],
      cacheConfig: {
        cachable: true,
      },
      options: {
        displayPerformanceMetrics: true,
      },
    })
    class AHTest {}

    const app = anthill();

    const controllerInstance: InstanceType<AHRestControllerClass<any>> =
      app["_dependencyContainer"].resolve<InstanceType<AHRestControllerClass<any>>>("AHTest");

    expect(AHObjectHelper.isEquivalentObj(controllerInstance._restHandlerConfig, {
      middlewares: [],
      cacheConfig: {
        cachable: true,
      },
      options: {
        displayPerformanceMetrics: true,
      },
    })).toEqual(true);
  });
});
