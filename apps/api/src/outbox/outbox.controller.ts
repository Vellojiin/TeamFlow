import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OutboxPublisher } from './outbox.publisher';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('outbox')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('outbox')
export class OutboxController {
  constructor(private readonly outboxPublisher: OutboxPublisher) {}

  @ApiOperation({ summary: 'Estado del publisher de outbox' })
  @ApiResponse({ status: 200, description: 'Estado actual del outbox publisher' })
  @Get('status')
  async status() {
    return {
      status: await this.outboxPublisher.getStatus(),
    };
  }
}
