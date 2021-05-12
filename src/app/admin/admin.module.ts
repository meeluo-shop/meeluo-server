import { AdminRoleModule } from './role';
import { AdminPassportModule } from './passport';
import { AdminMenuModule } from './menu';
import { AdminPermissionModule } from './permission';
import { AdminUserModule } from './user';
import { AdminAgentModule } from './agent';
import { AdminGameModule } from './game';
import { AdminMerchantModule } from './merchant';
import { AdminExpressModule } from './express';
import { AuthModule } from '@core/decorator';
import { ADMIN_TOKEN_HEADER } from '@core/constant';

const modules = [
  AdminUserModule,
  AdminMenuModule,
  AdminPermissionModule,
  AdminRoleModule,
  AdminPassportModule,
  AdminAgentModule,
  AdminGameModule,
  AdminMerchantModule,
  AdminExpressModule,
];

@AuthModule({
  header: ADMIN_TOKEN_HEADER,
  imports: modules,
  providers: [],
  exports: modules,
  controllers: [],
})
export class AdminModule {}
