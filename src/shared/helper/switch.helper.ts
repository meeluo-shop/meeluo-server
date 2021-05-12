const switchMetadataKey = 'switch_metadata_case_value';

export function Case(value): MethodDecorator {
  return (target, propertyKey) => {
    const metadataVal = Reflect.getMetadata(switchMetadataKey, target) || {};
    const values = Object.keys(metadataVal);
    if (values.includes(value)) {
      throw new Error(`Case注解的值(${value})已经存在，请勿重复设置`);
    }
    metadataVal[value] = propertyKey;
    Reflect.defineMetadata(switchMetadataKey, metadataVal, target);
  };
}

export function switchHandler<R = any>(
  instance,
  value,
  switchDefault = () => {
    return;
  },
): R {
  const metadataVal =
    Reflect.getMetadata(switchMetadataKey, instance.constructor.prototype) ||
    {};
  const propertyKey = metadataVal[value];
  if (!propertyKey || !instance[propertyKey]) {
    return switchDefault.bind(instance);
  }
  return instance[propertyKey].bind(instance);
}
