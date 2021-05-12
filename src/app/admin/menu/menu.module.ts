import { Module } from '@nestjs/common';
import { AdminMenuController } from './menu.controller';
import { AdminMenuService } from './menu.service';

const providers = [AdminMenuService];

@Module({
  imports: [],
  providers,
  exports: providers,
  controllers: [AdminMenuController],
})
export class AdminMenuModule {}
