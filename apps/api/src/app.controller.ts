import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get()
  getHello(): { message: string } {
    return { message: 'TeamFlow API' };
  }

  @Get('health/database')
  async databaseHealth() {
    await this.prismaService.client.$queryRaw`SELECT 1`;
    return { status: 'ok', database: 'connected' };
  }
}
