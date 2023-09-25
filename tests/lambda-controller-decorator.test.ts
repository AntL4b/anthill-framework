import { AHObjectHelper, Anthill, LambdaController, anthill } from "../packages";
import { AHLambdaControllerClass } from "../packages/core/models/controller-class/lambda-controller-class";

describe("LambdaController decorator", () => {
  beforeEach(() => {
    Anthill["instance"] = null;
  });

  test("LambdaController decorator without params", async () => {
    @LambdaController()
    class AHTest {}

    const app = anthill();

    expect(Object.keys(app["_dependencyContainer"]["container"]).includes("AHTest")).toEqual(true);
  });

  test("RestController decorator with params", async () => {
    @LambdaController({
      options: {
        displayPerformanceMetrics: true,
      },
    })
    class AHTest {}

    const app = anthill();

    const controllerInstance: InstanceType<AHLambdaControllerClass<any>> =
      app["_dependencyContainer"].resolve<InstanceType<AHLambdaControllerClass<any>>>("AHTest");

    expect(
      AHObjectHelper.isEquivalentObj(controllerInstance._lambdaHandlerConfig, {
        options: {
          displayPerformanceMetrics: true,
        },
      }),
    ).toEqual(true);
  });
});
