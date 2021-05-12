import { Provider, Inject } from '@nestjs/common';
import { QiniuService } from './qiniu.service';

const decoratedTokenPrefix = 'Qiniu:';
const decoratedBuckets = new Set<string>();

function createDecoratedServiceProvider(
  bucket: string,
): Provider<Promise<QiniuService>> {
  return {
    provide: `${decoratedTokenPrefix}${bucket}`,
    useFactory: async (qiniuService: QiniuService) => {
      qiniuService.init(bucket);
      return qiniuService;
    },
    inject: [QiniuService],
  };
}

export function InjectQiniuService(bucket: string) {
  decoratedBuckets.add(bucket);
  return Inject(`${decoratedTokenPrefix}${bucket}`);
}

export function createQiniuServiceForDecorated() {
  return [...decoratedBuckets.values()].map(bucket =>
    createDecoratedServiceProvider(bucket),
  );
}
