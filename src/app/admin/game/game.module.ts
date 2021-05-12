import { Module } from '@nestjs/common';
import { ResourceModule } from '@app/common/resource';
import { AdminGameCategoryModule } from './category';
import { AdminGameController } from './game.controller';
import { AdminGameService } from './game.service';

const providers = [AdminGameService];
const modules = [ResourceModule, AdminGameCategoryModule];

@Module({
  imports: modules,
  providers,
  exports: [...modules, ...providers],
  controllers: [AdminGameController],
})
export class AdminGameModule {}
