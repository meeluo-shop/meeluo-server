import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { MerchantStaffPermissionService } from './permission.service';

@Injectable()
export class MerchantStaffPermissionLifecycle implements OnModuleInit {
  constructor(
    @Inject(MerchantStaffPermissionService)
    private permService: MerchantStaffPermissionService,
  ) {}

  async onModuleInit() {
    await this.permService.initPermission();
  }
}
