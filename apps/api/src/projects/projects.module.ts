import { Module } from "@nestjs/common";

import { ProjectsService } from "./projects.service";
import { ProjectsController } from "./projects.controller";

import { DatabaseModule } from "../database/database.module";
import { RolesGuard } from "../auth/guards/roles.guard";
import { OrganizationAccessGuard } from "../auth/guards/organization-access.guard";

@Module({
    imports: [DatabaseModule],
    controllers: [ProjectsController],
    providers: [ProjectsService, RolesGuard, OrganizationAccessGuard]
})
export class ProjectsModule {}