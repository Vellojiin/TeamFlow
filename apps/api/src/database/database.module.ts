import { Global, Module } from '@nestjs/common';
import { PrismaService } from '@teamflow/database';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
