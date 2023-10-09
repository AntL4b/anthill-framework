import { AnthillException } from "../packages";
import { DependencyContainer } from "../packages/core/dependency-container";

describe("DependencyContainer", () => {
  test("register", () => {
    const dependencyContainer = new DependencyContainer();
    class Test {};
    dependencyContainer.register("Test", Test);

    expect(Object.keys(dependencyContainer["container"]).includes("Test")).toEqual(true);
    expect(dependencyContainer["container"]["Test"].constructor).toBeTruthy();
  });

  test("resolve", () => {
    const dependencyContainer = new DependencyContainer();
    class Test {};
    dependencyContainer.register("Test", Test);

    expect(dependencyContainer["container"]["Test"].instance).toEqual(null);

    const instance = dependencyContainer.resolve<Test>("Test");
    
    expect(instance).toBeInstanceOf(Test);
    expect(dependencyContainer["container"]["Test"].instance).toEqual(instance);
  });

  test("resolve fails", () => {
    const dependencyContainer = new DependencyContainer();    
    expect(() => { dependencyContainer.resolve<any>("Test") }).toThrow(AnthillException);
  });
});
