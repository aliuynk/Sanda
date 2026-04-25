import { getServerEnv, logger } from '@sanda/core';

/**
 * SMS provider adapter. Supports the two most-used Turkish providers plus a
 * mock transport used in development.
 */
export async function sendSms(phoneE164: string, body: string): Promise<void> {
  const env = getServerEnv();
  const log = logger.child({ module: 'sms', provider: env.SMS_PROVIDER });

  switch (env.SMS_PROVIDER) {
    case 'netgsm':
      return sendViaNetGsm(phoneE164, body);
    case 'iletimerkezi':
      return sendViaIletimerkezi(phoneE164, body);
    case 'mock':
    default:
      log.info({ phone: phoneE164, body }, 'MOCK SMS (no network call).');
      return;
  }
}

async function sendViaNetGsm(_phone: string, _body: string) {
  // Real impl: POST to https://api.netgsm.com.tr/sms/rest/v2/send
  throw new Error('NetGSM integration not yet configured.');
}

async function sendViaIletimerkezi(_phone: string, _body: string) {
  // Real impl: POST to https://api.iletimerkezi.com/v1/send-sms
  throw new Error('İletimerkezi integration not yet configured.');
}
