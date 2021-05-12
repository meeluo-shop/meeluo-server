import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { AdminPermissionService } from './permission.service';

@Injectable()
export class AdminPermissionLifecycle implements OnModuleInit {
  constructor(
    @Inject(AdminPermissionService) private permService: AdminPermissionService,
  ) {}

  async onModuleInit() {
    await this.permService.initPermission();
  }
}
