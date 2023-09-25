import { AHDependencyContainer } from "../core/dependency-container";

describe("AHDependencyContainer", () => {
  test("register", () => {
    const dependencyContainer = new AHDependencyContainer();
    class Test {};
    dependencyContainer.register("Test", Test);

    expect(Object.keys(dependencyContainer["container"]).includes("Test")).toEqual(true);
    expect(dependencyContainer["container"]["Test"].constructor).toBeTruthy();
  });

  test("resolve", () => {
    const dependencyContainer = new AHDependencyContainer();
    class Test {};
    dependencyContainer.register("Test", Test);

    expect(dependencyContainer["container"]["Test"].instance).toEqual(null);

    const instance = dependencyContainer.resolve<Test>("Test");
    
    expect(instance).toBeInstanceOf(Test);
    expect(dependencyContainer["container"]["Test"].instance).toEqual(instance);
  });
});
