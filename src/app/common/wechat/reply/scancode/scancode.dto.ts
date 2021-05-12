import { ApiProperty } from '@shared/swagger';
import { MaxLength } from 'class-validator';

export class WechatReplyScanCodeDTO {
  @ApiProperty({
    type: String,
    description: '回复标题',
  })
  @MaxLength(50, { message: '回复标题长度不能超过50' })
  title = '点击进入游戏活动大厅';

  @ApiProperty({
    type: String,
    description: '回复描述',
  })
  @MaxLength(100, { message: '回复描述长度不能超过100' })
  introduction = '免费好礼等你来拿，千万不错过哦！';

  @ApiProperty({
    type: String,
    description: '回复图片地址',
  })
  @MaxLength(200, { message: '回复图片地址长度不能超过200' })
  imageUrl = 'https://assets.meeluo.com/5ff5802a07150_03.jpg';
}
