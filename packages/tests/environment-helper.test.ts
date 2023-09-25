import { AHException } from "..";
import { AHEnvironmentHelper } from "..";
import { AHEnvEnum } from "..";

describe("AHEnvironmentHelper", () => {
  test("Get dev environment", () => {
    process.env.ENV = "dev";
    expect(AHEnvironmentHelper.getEnv()).toEqual(AHEnvEnum.Dev);
  });

  test("Get prod environment", () => {
    process.env.ENV = "prod";
    expect(AHEnvironmentHelper.getEnv()).toEqual(AHEnvEnum.Prod);
  });

  test("Get env value exists", () => {
    process.env.TEST = "test";
    expect(AHEnvironmentHelper.getEnvValue("TEST")).toEqual("test");
  });

  test("Get env value doesn't exist", () => {
    expect(() => AHEnvironmentHelper.getEnvValue("TEST_DOESNT_EXIST")).toThrow(AHException);
  });
});
