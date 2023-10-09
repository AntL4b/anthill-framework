import { ObjectHelper, Anthill, LambdaController, anthill } from "../packages";
import { LambdaControllerClass } from "../packages/core/models/lambda-controller-class";

describe("LambdaController decorator", () => {
  beforeEach(() => {
    Anthill["instance"] = null;
  });

  test("LambdaController decorator without params", async () => {
    @LambdaController()
    class Test {}

    const app = anthill();
    app.configure({
      controllers: [Test]
    });

    expect(Object.keys(app["_dependencyContainer"]["container"]).includes("Test")).toEqual(true);
  });

  test("RestController decorator with params", async () => {
    @LambdaController({
      options: {
        displayPerformanceMetrics: true,
      },
    })
    class Test {}

    const app = anthill();
    app.configure({
      controllers: [Test]
    });

    const controllerInstance = app["_dependencyContainer"].resolve<InstanceType<LambdaControllerClass>>("Test");

    expect(
      ObjectHelper.isEquivalentObj(controllerInstance._lambdaHandlerConfig, {
        options: {
          displayPerformanceMetrics: true,
        },
      }),
    ).toEqual(true);
  });
});
