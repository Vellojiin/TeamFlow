import { Module } from "@nestjs/common";

import { DatabaseModule } from "../database/database.module";
import { RolesGuard } from "../auth/guards/roles.guard";

import { OrganizationMembersController } from "./organization-members.controller";
import { OrganizationMemberService } from "./organization-members.service";

@Module({
    imports: [DatabaseModule],
    controllers: [OrganizationMembersController],
    providers: [
    OrganizationMemberService,
    RolesGuard,
    ],
})
export class OrganizationMembersModule {}