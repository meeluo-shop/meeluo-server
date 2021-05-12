import { AdminLoginSuccessDTO } from '@app/admin/passport';
import { MerchantLoginSuccessDTO } from '@app/merchant/passport';
import { ClientJwtPayloadDTO } from '@app/client/passport';
import { AgentLoginSuccessDTO } from '@app/agent/passport';

declare global {
  type AdminIdentity = AdminLoginSuccessDTO;
  type MerchantIdentity = MerchantLoginSuccessDTO;
  type ClientIdentity = ClientJwtPayloadDTO;
  type AgentIdentity = AgentLoginSuccessDTO;
  type CommonIdentity =
    | AdminIdentity
    | MerchantIdentity
    | ClientIdentity
    | AgentLoginSuccessDTO;
}
