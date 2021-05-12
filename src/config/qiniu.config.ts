import { QiniuOption } from '@shared/qiniu';
import { MEELUO_BUCKET } from '@core/constant';

export default [
  {
    bucket: MEELUO_BUCKET,
    domain: 'https://assets.meeluo.com/',
    accessKey: '',
    secretKey: '',
    putPolicy: {
      returnBody:
        '{"key":"$(key)","hash":"$(etag)","uuid":"$(uuid)","fsize":$(fsize),"bucket":"$(bucket)","mimeType":"${mimeType}","group":"$(x:group)","userId":"$(x:userId)","merchantId":"$(x:merchantId)","extension":"$(x:extension)"}',
    },
  },
] as QiniuOption[];
