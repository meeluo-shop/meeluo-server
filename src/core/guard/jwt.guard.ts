import { FastifyRequest } from 'fastify';
import {
  Injectable,
  CanActivate,
  Inject,
  ExecutionContext,
} from '@nestjs/common';
import { AdminPassportService } from '@app/admin/passport/passport.service';
import { MerchantPassportService } from '@app/merchant/passport/passport.service';
import { ClientPassportService } from '@app/client/passport/passport.service';
import { AgentPassportService } from '@app/agent/passport/passport.service';
import {
  ADMIN_TOKEN_HEADER,
  AGENT_TOKEN_HEADER,
  MERCHANT_TOKEN_HEADER,
  AUTH_MODULE_METADATA,
  CLIENT_TOKEN_HEADER,
} from '@core/constant';
import { Reflector } from '@nestjs/core';
import { UnauthorizedException } from '@jiaxinjiang/nest-exception';
import { Case, switchHandler } from '@shared/helper';

class JwtIllegalRequestException extends UnauthorizedException {
  readonly code: number = 777777;
  readonly msg: string = '非法请求，请重新登陆';
}

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    @Inject(Reflector)
    private readonly reflector: Reflector,
    @Inject(AdminPassportService)
    private readonly adminAuthService: AdminPassportService,
    @Inject(AgentPassportService)
    private readonly agentAuthService: AgentPassportService,
    @Inject(ClientPassportService)
    private readonly clientAuthService: ClientPassportService,
    @Inject(MerchantPassportService)
    private readonly merchantAuthService: MerchantPassportService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const controller = context.getClass();
    let headerKey = this.reflector.get<string>(
      AUTH_MODULE_METADATA,
      controller,
    );
    const request: FastifyRequest = context.switchToHttp().getRequest();
    if (!headerKey) {
      const { headers } = request;
      [
        ADMIN_TOKEN_HEADER,
        AGENT_TOKEN_HEADER,
        MERCHANT_TOKEN_HEADER,
        CLIENT_TOKEN_HEADER,
      ].forEach(key => headers[key] && (headerKey = key));
    }
    await switchHandler(this, headerKey, () => {
      throw new JwtIllegalRequestException();
    })(request);
    return true;
  }

  @Case(ADMIN_TOKEN_HEADER)
  async adminJwt(request: FastifyRequest) {
    const authorization = request.headers[ADMIN_TOKEN_HEADER] as string;
    request.identity = await this.adminAuthService.validateJwt(authorization);
  }

  @Case(AGENT_TOKEN_HEADER)
  async agentJwt(request: FastifyRequest) {
    const authorization = request.headers[AGENT_TOKEN_HEADER] as string;
    request.identity = await this.agentAuthService.validateJwt(authorization);
  }

  @Case(MERCHANT_TOKEN_HEADER)
  async merchantJwt(request: FastifyRequest) {
    const merchatToken = request.headers[MERCHANT_TOKEN_HEADER] as string;
    request.identity = await this.merchantAuthService.validateJwt(merchatToken);
  }

  @Case(CLIENT_TOKEN_HEADER)
  async wechatJwt(request: FastifyRequest) {
    const wechatToken = request.headers[CLIENT_TOKEN_HEADER] as string;
    request.identity = await this.clientAuthService.validateJwt(wechatToken);
  }
}
