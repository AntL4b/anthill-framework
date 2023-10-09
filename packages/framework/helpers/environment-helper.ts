import { AnthillException } from "../features/anthill-exception";
import { EnvEnum } from "../models/enums/env-enum";

export class EnvironmentHelper {
  /**
   * Get the current environment
   * @returns The current environment
   */
  static getEnv(): EnvEnum {
    return process.env.ENV === EnvEnum.Prod ? EnvEnum.Prod : EnvEnum.Dev;
  }

  /**
   * Get an environment value
   * @param envKey The environment key to get
   * @returns The environment value matching the given key
   */
  static getEnvValue(envKey: string): string {
    if (!Object.keys(process.env).includes(envKey)) {
      throw new AnthillException("Error trying to access undefined environment key: " + envKey);
    }

    return process.env[envKey] as string;
  }
}
