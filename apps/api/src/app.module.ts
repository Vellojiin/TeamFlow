import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/user.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { OrganizationMembersModule } from './organization-members/organization-members.module';
import { ProjectsModule } from './projects/projects.module'; 
import { TasksModule } from './task/tasks.module';
import { QueueModule } from './queue/queue.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { OutboxModule } from './outbox/outbox.module';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    UsersModule,
    OrganizationsModule,
    OrganizationMembersModule,
    ProjectsModule,
    TasksModule,
    AuthModule,
    QueueModule,
    OutboxModule,
    ActivityLogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}