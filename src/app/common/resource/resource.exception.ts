import { ApiException } from '@jiaxinjiang/nest-exception';

export class CreateResourceGroupFailedException extends ApiException {
  readonly code: number = 902001;
  readonly msg: string = '创建文件分组失败，请稍后再试';
}

export class UpdateResourceGroupFailedException extends ApiException {
  readonly code: number = 902002;
  readonly msg: string = '修改文件分组失败，请稍后再试';
}

export class DeleteResourceGroupFailedException extends ApiException {
  readonly code: number = 902003;
  readonly msg: string = '删除文件分组失败，请稍后再试';
}

export class CetResourceGroupsFailedException extends ApiException {
  readonly code: number = 902004;
  readonly msg: string = '获取文件分组列表失败，请稍后再试';
}

export class UploadResourceFailedException extends ApiException {
  readonly code: number = 902005;
  readonly msg: string = '上传文件失败，请刷新页面重新再试';
}

export class DeleteResourceFailedException extends ApiException {
  readonly code: number = 902006;
  readonly msg: string = '删除文件失败，请刷新页面重新再试';
}

export class MoveResourceFailedException extends ApiException {
  readonly code: number = 902007;
  readonly msg: string = '移动文件失败，请刷新页面重新再试';
}

export class CetResourcesFailedException extends ApiException {
  readonly code: number = 902008;
  readonly msg: string = '获取文件列表失败，请稍后再试';
}
