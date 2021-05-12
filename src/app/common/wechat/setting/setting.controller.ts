import { FileInterceptor } from '@webundsoehne/nest-fastify-file-upload';
import { File } from 'fastify-multer/lib/interfaces';
import { ApiTags, ApiOperation, ApiErrorResponse } from '@shared/swagger';
import {
  Controller,
  Inject,
  Get,
  Put,
  Body,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { Authorize, Identity } from '@core/decorator';
import { WechatSettingService } from './setting.service';
import {
  WechatGetPaymentSettingFailedException,
  WechatSetPaymentSettingFailedException,
  WechatGetOfficialAccountSettingFailedException,
  WechatSetOfficialAccountSettingFailedException,
  WechatPaymentUploadCertException,
  WechatPaymentGetCertNameException,
} from './setting.exception';
import {
  WechatOfficialAccountSettingDTO,
  WechatPaymentSettingDTO,
} from './setting.dto';
import { CommonService } from '../../common.service';

@ApiTags('微信设置相关接口')
@Controller('common/wechat/setting')
export class WechatSettingController {
  constructor(
    @Inject(CommonService)
    private commonService: CommonService,
    @Inject(WechatSettingService)
    private settingService: WechatSettingService,
  ) {}

  @Authorize()
  @Get('official_account')
  @ApiOperation({ summary: '获取微信公众号设置' })
  @ApiErrorResponse(WechatGetOfficialAccountSettingFailedException)
  async getOfficialSetting(@Identity() identity: CommonIdentity) {
    const terminal = this.commonService.getTerminal(identity);
    return this.settingService.getOfficialAccount(terminal.target, terminal.id);
  }

  @Authorize()
  @Put('official_account')
  @ApiOperation({ summary: '更新微信公众号设置' })
  @ApiErrorResponse(WechatSetOfficialAccountSettingFailedException)
  async setOfficialSetting(
    @Body() body: WechatOfficialAccountSettingDTO,
    @Identity() identity: CommonIdentity,
  ) {
    const terminal = this.commonService.getTerminal(identity);
    return this.settingService.setOfficialAccount({
      data: body,
      userId: identity.userId,
      ...terminal,
    });
  }

  @Authorize()
  @Get('payment')
  @ApiOperation({ summary: '获取微信支付商户设置' })
  @ApiErrorResponse(WechatGetPaymentSettingFailedException)
  async getPaymentSetting(@Identity() identity: CommonIdentity) {
    const terminal = this.commonService.getTerminal(identity);
    return this.settingService.getPayment(terminal.target, terminal.id);
  }

  @Authorize()
  @Put('payment')
  @ApiOperation({ summary: '更新微信支付商户设置' })
  @ApiErrorResponse(WechatSetPaymentSettingFailedException)
  async setPaymentSetting(
    @Body() body: WechatPaymentSettingDTO,
    @Identity() identity: CommonIdentity,
  ) {
    const terminal = this.commonService.getTerminal(identity);
    return this.settingService.setPayment({
      data: body,
      userId: identity.userId,
      ...terminal,
    });
  }

  @Authorize()
  @Post('payment/cert')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '上传微信支付证书' })
  @ApiErrorResponse(WechatPaymentUploadCertException)
  async uploadCert(
    @UploadedFile() file: File,
    @Identity() identity: CommonIdentity,
  ) {
    const terminal = this.commonService.getTerminal(identity);
    return this.settingService.uploadPaymentCert({
      file,
      userId: identity.userId,
      ...terminal,
    });
  }

  @Authorize()
  @Get('payment/cert_name')
  @ApiOperation({ summary: '获取微信支付证书文件名' })
  @ApiErrorResponse(WechatPaymentGetCertNameException)
  async getCert(@Identity() identity: CommonIdentity) {
    const terminal = this.commonService.getTerminal(identity);
    const certInfo = await this.settingService.getPaymentCert(
      terminal.target,
      terminal.id,
    );
    certInfo && delete certInfo.content;
    return certInfo;
  }
}
