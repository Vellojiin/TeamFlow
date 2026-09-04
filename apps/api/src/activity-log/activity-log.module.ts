import { Module } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [DatabaseModule],
    providers: [ActivityLogService],
    exports: [ActivityLogService],
})
export class ActivityLogModule {}