import { Module } from '@nestjs/common';
import { ResourceModule } from '@app/common/resource';
import { AdminGameCategoryController } from './category.controller';
import { AdminGameCategoryService } from './category.service';

const providers = [AdminGameCategoryService];
const modules = [ResourceModule];

@Module({
  imports: modules,
  providers,
  exports: [...modules, ...providers],
  controllers: [AdminGameCategoryController],
})
export class AdminGameCategoryModule {}
