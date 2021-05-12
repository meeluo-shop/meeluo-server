import { Module, Global } from '@nestjs/common';
import { AdminRoleModule } from '@app/admin/role';
import { AdminUserModule } from '@app/admin/user';
import { AdminPassportController } from './passport.controller';
import { AdminPassportService } from './passport.service';

const providers = [AdminPassportService];

@Global()
@Module({
  imports: [AdminUserModule, AdminRoleModule],
  providers,
  exports: providers,
  controllers: [AdminPassportController],
})
export class AdminPassportModule {}
