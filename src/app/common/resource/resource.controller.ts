import {
  Inject,
  Controller,
  Put,
  Body,
  Post,
  Param,
  Delete,
  Get,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiErrorResponse,
  ApiOkResponse,
} from '@shared/swagger';
import { CommonResourceEntity } from '@typeorm/meeluoShop';
import { ResourceService } from './resource.service';
import {
  CreateResourceGroupFailedException,
  UpdateResourceGroupFailedException,
  DeleteResourceGroupFailedException,
  CetResourceGroupsFailedException,
  UploadResourceFailedException,
  DeleteResourceFailedException,
  MoveResourceFailedException,
  CetResourcesFailedException,
} from './resource.exception';
import {
  ResourceListDTO,
  ResourceIdsDTO,
  UploadFilesDTO,
  ModifyResourceGroupDTO,
  ResourceGroupIdDTO,
  ResourceGroupListDTO,
  MoveResourceDTO,
} from './resource.dto';
import { Identity, Authorize } from '@core/decorator';

@ApiTags('资源文件管理相关接口')
@Controller('common/resource')
export class ResourceController {
  constructor(
    @Inject(ResourceService) private resourceService: ResourceService,
  ) {}

  @Authorize()
  @Get('list')
  @ApiOperation({ summary: '获取上传的文件列表' })
  @ApiOkResponse({ type: [CommonResourceEntity] })
  @ApiErrorResponse(CetResourcesFailedException)
  async list(
    @Query() query: ResourceListDTO,
    @Identity() identity: CommonIdentity,
  ) {
    return this.resourceService.getFiles(query, identity);
  }

  @Authorize()
  @Post('upload')
  @ApiOperation({ summary: '批量上传文件' })
  @ApiErrorResponse(UploadResourceFailedException)
  async upload(
    @Body() body: UploadFilesDTO,
    @Identity() identity: CommonIdentity,
  ) {
    return this.resourceService.uploadFiles(body, identity);
  }

  @Authorize()
  @Delete('delete')
  @ApiOperation({ summary: '批量删除文件' })
  @ApiErrorResponse(DeleteResourceFailedException)
  async delete(
    @Body() { ids }: ResourceIdsDTO,
    @Identity() identity: CommonIdentity,
  ) {
    return this.resourceService.deleteFiles(ids, identity);
  }

  @Authorize()
  @Put('move')
  @ApiOperation({ summary: '批量移动文件' })
  @ApiErrorResponse(MoveResourceFailedException)
  async move(
    @Body() { ids, groupId }: MoveResourceDTO,
    @Identity() identity: CommonIdentity,
  ) {
    return this.resourceService.moveFiles(ids, groupId, identity);
  }

  @Authorize()
  @Get('group/list')
  @ApiOperation({ summary: '获取文件分组列表' })
  @ApiErrorResponse(CetResourceGroupsFailedException)
  async getGroup(
    @Query() query: ResourceGroupListDTO,
    @Identity() identity: CommonIdentity,
  ) {
    return this.resourceService.getGroupList(query, identity);
  }

  @Authorize()
  @Post('group/create')
  @ApiOperation({ summary: '新增文件分组' })
  @ApiErrorResponse(CreateResourceGroupFailedException)
  async addGroup(
    @Body() body: ModifyResourceGroupDTO,
    @Identity() identity: CommonIdentity,
  ) {
    return this.resourceService.addGroup(body, identity);
  }

  @Authorize()
  @Put('group/update/:id')
  @ApiOperation({ summary: '修改文件分组' })
  @ApiErrorResponse(UpdateResourceGroupFailedException)
  async updateGroup(
    @Param() { id }: ResourceGroupIdDTO,
    @Body() body: ModifyResourceGroupDTO,
    @Identity() identity: CommonIdentity,
  ) {
    return this.resourceService.updateGroup(id, body, identity);
  }

  @Authorize()
  @Delete('group/delete/:id')
  @ApiOperation({ summary: '删除文件分组' })
  @ApiErrorResponse(DeleteResourceGroupFailedException)
  async deleteGroup(
    @Param() { id }: ResourceGroupIdDTO,
    @Identity() identity: CommonIdentity,
  ) {
    return this.resourceService.deleteGroup(id, identity);
  }
}
