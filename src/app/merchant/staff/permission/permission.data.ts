import * as perms from './permission.constant';
import { PermStructure } from './permission.interface';

export const permissions = [
  {
    name: '增删改导航',
    code: perms.WRITE_MERCHANT_MENU,
  },
  {
    name: '查看导航',
    code: perms.READ_MERCHANT_MENU,
  },
  {
    name: '增删改角色',
    code: perms.WRITE_MERCHANT_ROLE,
  },
  {
    name: '查看角色',
    code: perms.READ_MERCHANT_ROLE,
  },
  {
    name: '增删改用户',
    code: perms.WRITE_MERCHANT_USER,
  },
  {
    name: '查看用户',
    code: perms.READ_MERCHANT_USER,
  },
] as PermStructure[];
