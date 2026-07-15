const OBJECT_ID_PATTERN = /^[a-fA-F0-9]{24}$/;

export function isValidObjectId(value: string): boolean {
  return OBJECT_ID_PATTERN.test(value);
}
