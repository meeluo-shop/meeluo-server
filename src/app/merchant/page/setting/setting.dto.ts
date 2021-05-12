import { ApiProperty } from '@shared/swagger';
import { MinLength, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

const defaultPageValue = {
  page: {
    type: 'page',
    name: '首页',
    params: {
      name: '页面名称',
      title: '页面标题',
    },
    style: {
      titleTextColor: 'dark',
      titleBackgroundColor: '#ffffff',
      globalBackground: '#fcfcfc',
    },
  },
  items: [],
};

export class MerchantPageSettingDTO {
  @ApiProperty({
    type: String,
    description: '页面内容配置',
  })
  @MinLength(1, { message: '页面内容配置不能为空' })
  data: string = JSON.stringify(defaultPageValue);
}

export class MerchantPageSettingIdDTO {
  @ApiProperty({
    description: '页面id',
  })
  @Type(() => Number)
  @IsInt({ message: '页面id必须为数字类型' })
  pageId: number;
}
