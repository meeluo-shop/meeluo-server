import { ApiProperty } from '@shared/swagger';
import { IsString, MaxLength } from 'class-validator';

export class WechatGetIndustryDTO {
  primaryIndustry: {
    firstClass: string;
    secondClass: string;
  };
  secondaryIndustry: {
    firstClass: string;
    secondClass: string;
  };
}

export class WechatTemplateIdDTO {
  @ApiProperty({
    description: '模板消息id',
  })
  @IsString({ message: '错误的模板消息id' })
  @MaxLength(500, { message: '错误的模板消息id' })
  id: string;
}
