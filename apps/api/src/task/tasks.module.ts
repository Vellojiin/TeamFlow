import { Module } from "@nestjs/common";

import { DatabaseModule } from "../database/database.module";
import { OrganizationAccessGuard } from "../auth/guards/organization-access.guard";
import { RolesGuard } from "../auth/guards/roles.guard";

import { TaskController } from "./tasks.controller";
import { TaskService } from "./tasks.service";

@Module({
    imports: [DatabaseModule],
    controllers: [TaskController],
    providers: [
    TaskService,
    OrganizationAccessGuard,
    RolesGuard,
    ],
})
export class TasksModule {}