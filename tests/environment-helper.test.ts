import { AnthillException, EnvironmentHelper, EnvEnum } from "../packages";

describe("EnvironmentHelper", () => {
  test("Get dev environment", () => {
    process.env.ENV = "dev";
    expect(EnvironmentHelper.getEnv()).toEqual(EnvEnum.Dev);
  });

  test("Get prod environment", () => {
    process.env.ENV = "prod";
    expect(EnvironmentHelper.getEnv()).toEqual(EnvEnum.Prod);
  });

  test("Get env value exists", () => {
    process.env.TEST = "test";
    expect(EnvironmentHelper.getEnvValue("TEST")).toEqual("test");
  });

  test("Get env value doesn't exist", () => {
    expect(() => EnvironmentHelper.getEnvValue("TEST_DOESNT_EXIST")).toThrow(AnthillException);
  });
});
