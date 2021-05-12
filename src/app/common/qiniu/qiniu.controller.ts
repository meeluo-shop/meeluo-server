import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiErrorResponse } from '@shared/swagger';
import { Authorize } from '@core/decorator';
import { MEELUO_BUCKET } from '@core/constant';
import { QiniuService, InjectQiniuService } from '@shared/qiniu';
import { GetQiniuTokenFailedException } from './qiniu.exception';

@ApiTags('七牛云相关接口')
@Controller('common/qiniu')
export class QiniuController {
  constructor(
    @InjectQiniuService(MEELUO_BUCKET)
    private qiniuService: QiniuService,
  ) {}

  @Authorize()
  @Get('upload/token')
  @ApiOperation({ summary: '获取七牛上传凭证' })
  @ApiErrorResponse(GetQiniuTokenFailedException)
  async getUploadToken() {
    return this.qiniuService.getToken();
  }
}
