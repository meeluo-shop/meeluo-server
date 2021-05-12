import { ApiProperty } from '@shared/swagger';
import { MinLength } from 'class-validator';

export class WechatMenuAttr {
  @ApiProperty({
    required: false,
    description:
      '菜单的类型, view（跳转网页）、text（返回文本，下同）、img、photo、video、voice、click、miniprogram',
  })
  type?:
    | 'view'
    | 'text'
    | 'img'
    | 'photo'
    | 'video'
    | 'voice'
    | 'miniprogram'
    | 'click';

  @ApiProperty({
    description: '菜单名称',
  })
  name: string;

  @ApiProperty({
    required: false,
    description: '点击类型传递的值',
  })
  key?: string;

  @ApiProperty({
    required: false,
    description: '小程序appid',
  })
  appid?: string;

  @ApiProperty({
    required: false,
    description: '媒体id',
  })
  mediaId?: string;

  @ApiProperty({
    required: false,
    description: '小程序地址',
  })
  pagepath?: string;

  @ApiProperty({
    required: false,
    description: '网页跳转地址',
  })
  url?: string;

  @ApiProperty({
    required: false,
    description: '参数值',
  })
  value?: string;
}

export class WechatMenuSubButton {
  @ApiProperty({
    required: false,
    description: '子菜单列表',
  })
  list?: WechatMenuAttr[];
}

export class WechatSelfMenuButton extends WechatMenuAttr {
  @ApiProperty({
    required: false,
    description: '子菜单',
  })
  subButton?: WechatMenuSubButton;
}

export class WechatMenuDTO {
  @ApiProperty({
    description: '菜单列表，json格式字符串',
  })
  @MinLength(1, { message: '菜单不能为空' })
  button: string;
}

export class MenuListResp {
  @ApiProperty({
    description: '菜单是否开启，0代表未开启，1代表开启',
  })
  isMenuOpen: 1 | 0;

  selfMenuInfo: {
    button: WechatSelfMenuButton[];
  };
}
