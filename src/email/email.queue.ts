// email.queue.ts

import { BullModule } from '@nestjs/bullmq';

export const MailQueueModule = BullModule.registerQueue({
  name: 'mail-queue',
});