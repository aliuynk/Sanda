import crypto from 'node:crypto';

import { getServerEnv, logger } from '@sanda/core';
import { prisma } from '@sanda/db';
import type { Job } from 'bullmq';

import { sendSms } from '../providers/sms';

interface OtpJob {
  otpId: string;
  phone: string;
}

export async function processOtp(job: Job<OtpJob>) {
  const env = getServerEnv();
  const { otpId, phone } = job.data;

  const log = logger.child({ module: 'otp', otpId });

  const code = crypto
    .randomInt(10 ** (env.SMS_OTP_LENGTH - 1), 10 ** env.SMS_OTP_LENGTH)
    .toString();
  const hash = crypto.createHash('sha256').update(code).digest('hex');

  await prisma.otpCode.update({
    where: { id: otpId },
    data: { codeHash: hash },
  });

  const message = `Sanda doğrulama kodun: ${code}. 5 dakika içinde geçerli. Kodu kimseyle paylaşma.`;
  await sendSms(phone, message);

  log.info('OTP dispatched');
}
