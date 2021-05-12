import {
  Controller,
  Inject,
  Post,
  Body,
  Param,
  Put,
  Get,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiErrorResponse,
  ApiOkResponse,
} from '@shared/swagger';
import { AdminAgentService } from './agent.service';
import { WRITE_ADMIN_AGENT, READ_ADMIN_AGENT } from '../permission';
import { Permissions, Identity } from '@core/decorator';
import {
  ActiveAgentDetailException,
  GetAgentsFailedException,
  GetAgentDetailException,
  CreateAgentFailedException,
  UpdateAgentFailedException,
} from './agent.exception';
import {
  AdminModifyAgentDTO,
  AdminAgentIdDTO,
  AdminAgentListDTO,
  AdminAgentActiveDTO,
  AdminAgentDetailResp,
} from './agent.dto';
import { AgentEntity } from '@typeorm/meeluoShop';

@ApiTags('管理员后台代理商相关接口')
@Controller('admin/agent')
export class AdminAgentController {
  constructor(
    @Inject(AdminAgentService) private agentService: AdminAgentService,
  ) {}

  @Permissions(READ_ADMIN_AGENT)
  @Get('list')
  @ApiOperation({ summary: '获取所有代理商列表' })
  @ApiOkResponse({ type: [AgentEntity] })
  @ApiErrorResponse(GetAgentsFailedException)
  async list(@Query() query: AdminAgentListDTO) {
    return this.agentService.list(query);
  }

  @Permissions(READ_ADMIN_AGENT)
  @Get('detail/:id')
  @ApiOperation({ summary: '获取代理商详情' })
  @ApiOkResponse({ type: AdminAgentDetailResp })
  @ApiErrorResponse(GetAgentDetailException)
  async detail(@Param() { id }: AdminAgentIdDTO) {
    return this.agentService.detail(id);
  }

  @Permissions(WRITE_ADMIN_AGENT)
  @Put('active/:id')
  @ApiOperation({ summary: '是否启用该代理商' })
  @ApiErrorResponse(ActiveAgentDetailException)
  async active(
    @Param() { id }: AdminAgentIdDTO,
    @Body() { isActive }: AdminAgentActiveDTO,
    @Identity() identity,
  ) {
    return this.agentService.active(id, isActive, identity);
  }

  @Permissions(WRITE_ADMIN_AGENT)
  @Post('create')
  @ApiOperation({ summary: '新增代理商' })
  @ApiErrorResponse(CreateAgentFailedException)
  async create(
    @Body() body: AdminModifyAgentDTO,
    @Identity() identity: AdminIdentity,
  ) {
    return this.agentService.create(body, identity);
  }

  @Permissions(WRITE_ADMIN_AGENT)
  @Put('update/:id')
  @ApiOperation({ summary: '修改代理商' })
  @ApiErrorResponse(UpdateAgentFailedException)
  async update(
    @Param() { id }: AdminAgentIdDTO,
    @Body() body: AdminModifyAgentDTO,
    @Identity() identity: AdminIdentity,
  ) {
    return this.agentService.update(id, body, identity);
  }
}
