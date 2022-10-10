import { buildMessage, ValidateBy, ValidationOptions } from "class-validator";
import isBase64Validator from "validator/lib/isBase64";
import validator from "validator";
import IsBase64Options = validator.IsBase64Options;

export const IS_BASE64 = "isBase64";

/**
 * Checks if a string is base64 encoded.
 * If given value is not a string, then it returns false.
 */
export function isBase64(value: unknown, options?: IsBase64Options): boolean {
  return typeof value === "string" && isBase64Validator(value, options);
}

/**
 * Checks if a string is base64 encoded.
 * If given value is not a string, then it returns false.
 */
export function IsBase64(
  options?: IsBase64Options,
  validationOptions?: ValidationOptions
): PropertyDecorator {
  return ValidateBy(
    {
      name: IS_BASE64,
      constraints: [options],
      validator: {
        validate: (value, args): boolean =>
          isBase64(value, args.constraints[0]),
        defaultMessage: buildMessage(
          (eachPrefix) => eachPrefix + "$property must be base64 encoded",
          validationOptions
        )
      }
    },
    validationOptions
  );
}
