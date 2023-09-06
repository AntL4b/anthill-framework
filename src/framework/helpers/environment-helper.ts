
import { AHException } from "../features/anthill-exception";
import { AHEnvEnum } from "../models/enums/env-enum";


export class AHEnvironmentHelper {

  /**
   * Get the current environment
   * @returns The current environment
   */
  static getEnv(): AHEnvEnum {
    return process.env.ENV === AHEnvEnum.Prod ? AHEnvEnum.Prod : AHEnvEnum.Dev;
  }

  /**
   * Get an environment value
   * @param envKey The environment key to get
   * @returns The environment value matching the given key
   */
  static getEnvValue(envKey: string): string {
    if (!Object.keys(process.env).includes(envKey)) {
      throw new AHException("Error trying to access undefined environment key: " + envKey);
    }

    return process.env[envKey] as string;
  }
}
