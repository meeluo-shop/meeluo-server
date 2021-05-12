import { IsIn, ValidationOptions } from 'class-validator';
import { EnumHelperProvider } from '@shared/helper';

export function IsEnum(
  entity: Record<string, any>,
  validationOptions?: ValidationOptions,
) {
  const enumObj = EnumHelperProvider.transformEnum(entity);
  return IsIn(Object.values(enumObj), validationOptions);
}
