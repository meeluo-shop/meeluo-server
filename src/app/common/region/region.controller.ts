import { Inject, Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiErrorResponse } from '@shared/swagger';
import { Authorize } from '@core/decorator';
import { RegionService } from './region.service';
import { RegionNumberDTO, RegionParamDTO } from './region.dto';
import { GetRegionFailedException } from './region.exception';

@ApiTags('地区信息查询相关接口')
@Controller('common/region')
export class RegionController {
  constructor(@Inject(RegionService) private regionService: RegionService) {}

  @Authorize()
  @Get(':code')
  @ApiOperation({ summary: '使用行政编码获取省市区' })
  @ApiErrorResponse(GetRegionFailedException)
  async list(
    @Param() { code }: RegionNumberDTO,
    @Query() { isAll }: RegionParamDTO,
  ) {
    return this.regionService.getRegion(code, isAll);
  }
}
