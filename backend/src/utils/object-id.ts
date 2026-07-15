import { Types } from 'mongoose';

export function isValidObjectId(value: string): boolean {
  if (!Types.ObjectId.isValid(value)) {
    return false;
  }

  return new Types.ObjectId(value).toString() === value;
}
