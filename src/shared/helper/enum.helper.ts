import { Injectable } from '@nestjs/common';

@Injectable()
export class EnumHelperProvider {
  /**
   * 把enum转换成object
   * @param enumType
   */
  static transformEnum(enumType) {
    if (Array.isArray(enumType)) {
      return enumType;
    }
    if (typeof enumType !== 'object') {
      return [];
    }
    const values = {};
    const uniqueValues = {};
    Object.keys(enumType)
      .sort()
      .forEach(key => {
        const value = enumType[key];
        if (
          !uniqueValues.hasOwnProperty(value) &&
          !uniqueValues.hasOwnProperty(key)
        ) {
          const numberKey = parseInt(key);
          if (!isNaN(numberKey)) {
            values[value] = numberKey;
          } else {
            values[key] = value;
          }
          uniqueValues[value] = value;
        }
      });
    return values;
  }
}
