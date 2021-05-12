import * as perms from './permission.constant';
import { PermStructure } from './permission.interface';

export const permissions = [
  {
    name: '增删改导航',
    code: perms.WRITE_ADMIN_MENU,
  },
  {
    name: '查看导航',
    code: perms.READ_ADMIN_MENU,
  },
  {
    name: '增删改数据权限',
    code: perms.WRITE_ADMIN_PERM,
  },
  {
    name: '查看数据权限',
    code: perms.READ_ADMIN_PERM,
  },
  {
    name: '增删改角色',
    code: perms.WRITE_ADMIN_ROLE,
  },
  {
    name: '查看角色',
    code: perms.READ_ADMIN_ROLE,
  },
  {
    name: '增删改用户',
    code: perms.WRITE_ADMIN_USER,
  },
  {
    name: '查看用户',
    code: perms.READ_ADMIN_USER,
  },
  {
    name: '查看代理商权限',
    code: perms.READ_ADMIN_AGENT,
  },
  {
    name: '增删改代理商权限',
    code: perms.WRITE_ADMIN_AGENT,
  },
  {
    name: '查看商户权限',
    code: perms.READ_ADMIN_MERCHANT,
  },
  {
    name: '增删改商户权限',
    code: perms.WRITE_ADMIN_MERCHANT,
  },
  {
    name: '查看游戏权限',
    code: perms.READ_ADMIN_GAME,
  },
  {
    name: '增删改游戏权限',
    code: perms.WRITE_ADMIN_GAME,
  },
  {
    name: '查看物流公司权限',
    code: perms.READ_ADMIN_EXPRESS,
  },
  {
    name: '增删改物流公司权限',
    code: perms.WRITE_ADMIN_EXPRESS,
  },
] as PermStructure[];
