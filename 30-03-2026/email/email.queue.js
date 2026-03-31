"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailQueueModule = void 0;
const bullmq_1 = require("@nestjs/bullmq");
exports.MailQueueModule = bullmq_1.BullModule.registerQueue({
    name: 'mail-queue',
});
//# sourceMappingURL=email.queue.js.map