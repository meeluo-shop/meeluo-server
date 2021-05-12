import 'qiniu';

declare module 'qiniu' {
  namespace sms {
    namespace message {
      interface MsgResp {
        messageId?: string;
        jobId?: string;
        error?: string;
        message?: string;
        requestId?: string;
      }

      interface MsgParam {
        templateId: string;
        mobiles: string[];
        parameters: { [key: string]: string };
      }

      interface SingleMsgParam {
        templateId: string;
        mobile: string;
        parameters: { [key: string]: string };
      }

      interface FulltextMessageParam {
        mobiles: string[];
        content: string;
        templateType: 'notification' | 'verification' | 'marketing' | 'voice';
      }

      function sendMessage(
        reqBody: MsgParam,
        mac: auth.digest.Mac,
        callback: callback,
      ): void;

      function sendSingleMessage(
        reqBody: SingleMsgParam,
        mac: auth.digest.Mac,
        callback: callback,
      ): void;

      function sendOverseaMessage(
        reqBody: SingleMsgParam,
        mac: auth.digest.Mac,
        callback: callback,
      ): void;

      function sendFulltextMessage(
        reqBody: FulltextMessageParam,
        mac: auth.digest.Mac,
        callback: callback,
      ): void;
    }
  }
}
