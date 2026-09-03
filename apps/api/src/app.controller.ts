import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from './database/prisma.service';

@ApiTags('app ')
@Controller()
export class AppController {
  constructor(private readonly prismaService: PrismaService) {}

  @ApiOperation({ summary: 'Obtener mensaje de bienvenida de la API' })
  @ApiResponse({ status: 200, description: 'Mensaje de bienvenida' })
  @Get()
  getHello(): { message: string } {
    return { message: 'TeamFlow API' };
  }

  @ApiOperation({ summary: 'Verificar el estado de la base de datos' })
  @ApiResponse({ status: 200, description: 'Estado de la base de datos' })
  @Get('health/database')
  async databaseHealth() {
    await this.prismaService.client.$queryRaw`SELECT 1`;
    return { status: 'ok', database: 'connected' };
  }
}
