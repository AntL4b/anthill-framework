import { AHStringHelper } from "../framework/helpers/string-helper";

describe('AHStringHelper', () => {
  test('convertToXDigitStr', () => {
    expect(AHStringHelper.convertToXDigitStr(10, 3)).toBe('010');
  });

  test('slugify', () => {
    expect(AHStringHelper.slugify('a test')).toBe('a-test');
  });

  test('isValidEmail', () => {
    expect(AHStringHelper.isValidEmail('a.valid@email.com')).toBe(true);
    expect(AHStringHelper.isValidEmail('a.invalid@email-invalid')).toBe(false);
  });

  test('isUuid', () => {
    expect(AHStringHelper.isUuid('25fef4e4-a2c4-4b4a-b95a-cd5386556949')).toBe(true);
    expect(AHStringHelper.isUuid('25fef4e4-a2c4-4b4a-b95a-cd538655694')).toBe(false);
    expect(AHStringHelper.isUuid('not uuid')).toBe(false);
  });
});
