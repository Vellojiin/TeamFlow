import { OrganizationController } from "./organizations.controller";
import { OrganizationsService } from "./organizations.service";
import { Module } from "@nestjs/common";

@Module({
    controllers: [OrganizationController],
    providers: [OrganizationsService],
})
export class OrganizationsModule {} 