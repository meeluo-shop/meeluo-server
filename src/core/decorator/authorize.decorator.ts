import {
  Module,
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UseGuards,
  CanActivate,
  ModuleMetadata,
} from '@nestjs/common';
import { ApiHeader, ApiBearerAuth } from '@shared/swagger';
import { JwtGuard, RoleGuard, PermissionGuard } from '@core/guard';
import {
  AUTH_MODULE_METADATA,
  AUTHORIZE_METADATA,
  AUTH_ROLES_METADATA,
  AUTH_NOT_PERMS_METADATA,
  AUTH_NOT_ROLES_METADATA,
} from '@core/constant';

export interface AuthModuleMetadata extends ModuleMetadata {
  header?: string;
}

/**
 * 给控制器绑定所属根模块，用来做授权认证区分
 * @param module
 */
export const AuthModule = (
  options: AuthModuleMetadata,
): ClassDecorator => target => {
  const header = options.header || null;
  delete options.header;
  Module(options)(target);
  const bindAuthModule = (modules: any[]) => {
    for (const module of modules) {
      const ctrls = Reflect.getMetadata('controllers', module);
      if (ctrls && ctrls.length) {
        for (const ctrl of ctrls) {
          const metadata = Reflect.getMetadata(AUTH_MODULE_METADATA, ctrl);
          if (metadata === undefined) {
            Reflect.defineMetadata(AUTH_MODULE_METADATA, header, ctrl);
          }
        }
      }
      const imports = Reflect.getMetadata('imports', module);
      if (imports && imports.length) {
        bindAuthModule(imports);
      }
    }
  };
  const imports = options.imports || [];
  bindAuthModule([...imports, target]);
};

/**
 * 需要认证授权注解
 * @param guards
 */
export const Authorize = (
  ...guards: (CanActivate | Function)[]
): MethodDecorator & ClassDecorator => {
  return (
    target: any,
    key?: string | symbol,
    descriptor?: TypedPropertyDescriptor<any>,
  ) => {
    UseGuards(JwtGuard, ...guards)(target, key, descriptor);
    ApiBearerAuth('Token')(target, key, descriptor);
    ApiHeader({
      name: 'Authorization',
      description: '认证签名',
    })(target, key, descriptor);
    if (descriptor) {
      Reflect.defineMetadata(AUTHORIZE_METADATA, true, descriptor.value);
    } else {
      Reflect.defineMetadata(AUTHORIZE_METADATA, true, target);
    }
  };
};

/**
 * 支持所属角色与/或
 * 例：限制该用户必须是老师且是管理员
 * @Roles(['teacher', 'admin'])
 * 例：限制用户是老师，或者管理员
 * @Roles('teacher', 'admin')
 * 例：限制用户是管理员，或者是老师，或者是家长以及学生
 * @Roles('admin', 'teacher', ['parent', 'student'])
 */
export const Roles = (
  ...roles: Array<Array<string | null> | string>
): MethodDecorator & ClassDecorator => {
  return (
    target: any,
    key?: string | symbol,
    descriptor?: TypedPropertyDescriptor<any>,
  ) => {
    SetMetadata(AUTH_ROLES_METADATA, roles)(target, key, descriptor);
    Authorize(RoleGuard)(target, key, descriptor);
  };
};

export const NotRoles = (
  ...roles: Array<Array<string | null> | string>
): MethodDecorator & ClassDecorator => {
  return (
    target: any,
    key?: string | symbol,
    descriptor?: TypedPropertyDescriptor<any>,
  ) => {
    SetMetadata(AUTH_NOT_ROLES_METADATA, roles)(target, key, descriptor);
    Authorize(RoleGuard)(target, key, descriptor);
  };
};

/**
 * 获取身份认证信息注解
 */
export const Identity = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.identity;
  },
);

/**
 * 支持具体行为权限与/或
 * 例：限制用户必须要有“修改部门权限”和“添加部门权限”
 * @Permissions(['update_department', 'create_department'])
 * 例：限制用户有“修改部门权限”或“添加部门权限”
 * @Permissions('write_department', 'write_department')
 * 例：限制用户有“部门全部权限”，或者“查看部门权限”、“删除部门权限”、“添加部门权限”、“修改部门权限”
 * @Permissions('all_department', [
 *    'update_department',
 *    'create_department',
 *    'delete_department',
 *    'read_department',
 * ])
 */
export const Permissions = (...perms: Array<string | Array<string | null>>) => {
  return (
    target: any,
    key?: string | symbol,
    descriptor?: TypedPropertyDescriptor<any>,
  ) => {
    if (perms.length < 1) {
      throw new Error(
        `${target.constructor.name}.${String(key)} 定义了空权限编号`,
      );
    }
    for (const val of perms) {
      if (!val) {
        throw new Error(
          `${target.constructor.name}.${String(
            key,
          )} 定义了错误的权限编号: ${val}`,
        );
      }
    }
    SetMetadata(AUTH_NOT_PERMS_METADATA, perms)(target, key, descriptor);
    Authorize(PermissionGuard)(target, key, descriptor);
  };
};
