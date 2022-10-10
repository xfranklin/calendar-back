import { randomBytes } from "crypto";
import { promisify } from "util";

const asyncRandomBytes = promisify(randomBytes);

/**
 * Static class with async random generator functions
 */
export class RandomGenerator {
  /**
   * Generate random bytes
   * @param length
   */
  static async generateBytes(length: number): Promise<Buffer> {
    return await asyncRandomBytes(length);
  }

  /**
   * Generate random HEX string
   * @param length
   */
  static async generateHex(length: number): Promise<string> {
    return (await RandomGenerator.generateBytes(length)).toString("hex");
  }

  /**
   * Generate random base64 encoded string
   * @param length
   */
  static async generateBase64(length: number): Promise<string> {
    return (await RandomGenerator.generateBytes(length)).toString("base64");
  }

  /**
   * Generate random base64 encoded string, that safe for using in URL
   * @param length
   */
  static async generateBase64Url(length: number): Promise<string> {
    return (await RandomGenerator.generateBytes(length)).toString("base64url");
  }
}
