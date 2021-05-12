import { ApiProperty } from '@shared/swagger';
import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class ClientPageInfoDTO {
  page: {
    type: string;
    name: string;
    params: {
      name: string;
      title: string;
      shareTitle: string;
    };
    style: {
      titleTextColor: 'light' | 'dark';
      titleBackgroundColor: string;
      globalBackground: string;
    };
  };
  items: object[];
}

export class ClientPageIdDTO {
  @ApiProperty({
    description: '页面id',
  })
  @Type(() => Number)
  @IsInt({ message: '错误的页面id' })
  pageId: number;
}
