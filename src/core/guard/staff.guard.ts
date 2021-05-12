import { FastifyRequest } from 'fastify';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { UnauthorizedException } from '@jiaxinjiang/nest-exception';

class ClientAuthNoStaffException extends UnauthorizedException {
  readonly code: number = 777778;
  readonly msg: string = '当前用户不是商户员工，无权进行操作';
}

@Injectable()
export class StaffGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: FastifyRequest = context.switchToHttp().getRequest();
    const identity = request.identity as ClientIdentity;
    if (!identity.staffId) {
      throw new ClientAuthNoStaffException()
    }
    return true;
  }
}
