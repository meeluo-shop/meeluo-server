import { FastifyRequest } from 'fastify';
import { Reflector } from '@nestjs/core';
import {
  Injectable,
  CanActivate,
  Inject,
  ExecutionContext,
} from '@nestjs/common';
import { AdminPassportService } from '@app/admin/passport/passport.service';
import { AUTH_NOT_PERMS_METADATA } from '@core/constant';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(AdminPassportService)
    private readonly passportService: AdminPassportService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 获取绑定到控制器上到权限
    const perms = this.reflector.get<Array<Array<string | null> | string>>(
      AUTH_NOT_PERMS_METADATA,
      context.getHandler(),
    );
    const request: FastifyRequest = context.switchToHttp().getRequest();
    // 未被装饰器装饰，直接放行
    if (!perms) {
      return true;
    }
    // 校验当前用户身份是否有权限访问
    this.passportService.validatePerm(perms, request.identity as AdminIdentity);
    return true;
  }
}
