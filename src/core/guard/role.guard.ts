import { FastifyRequest } from 'fastify';
import {
  Injectable,
  CanActivate,
  Inject,
  ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminPassportService } from '@app/admin/passport/passport.service';
import { AUTH_ROLES_METADATA } from '@core/constant';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(AdminPassportService)
    private readonly passportService: AdminPassportService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 获取绑定到控制器上到角色
    const roles = this.reflector.get<Array<Array<string | null> | string>>(
      AUTH_ROLES_METADATA,
      context.getHandler(),
    );
    const request: FastifyRequest = context.switchToHttp().getRequest();
    // 未被装饰器装饰，直接放行
    if (!roles) {
      return true;
    }
    // 校验当前用户身份是否有权限访问
    this.passportService.validateRole(roles, request.identity as AdminIdentity);
    return true;
  }
}
