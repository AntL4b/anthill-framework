import { AHException } from "../framework/anthill-exception";
import { AHEnvironmentHelper } from "../framework/helpers/environment-helper";
import { AHEnvEnum } from "../framework/models/enums/env-enum";


describe('AHEnvironmentHelper', () => {
  test('get dev environment', () => {
    process.env.ENV = 'dev';
    expect(AHEnvironmentHelper.getEnv()).toBe(AHEnvEnum.Dev);
  });

  test('get prod environment', () => {
    process.env.ENV = 'prod';
    expect(AHEnvironmentHelper.getEnv()).toBe(AHEnvEnum.Prod);
  });

  test('get env value exists', () => {
    process.env.TEST = 'test';
    expect(AHEnvironmentHelper.getEnvValue('TEST')).toBe('test');
  });

  test("get env value doesn't exist", () => {
    expect(() => AHEnvironmentHelper.getEnvValue('TEST_DOESNT_EXIST')).toThrow(AHException);
  });
});
