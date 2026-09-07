import { Controller, Get } from '@nestjs/common';
import { OutboxPublisher } from './outbox.publisher';

@Controller('outbox')
export class OutboxController {
    constructor(private readonly outboxPublisher: OutboxPublisher) {}

    @Get('status')
    async status() {
        return {
            status: await this.outboxPublisher.getStatus(),
        }
    }
}