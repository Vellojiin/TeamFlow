import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";

enum OrganizationRole {
    OWNER = 'OWNER',
    ADMIN = 'ADMIN',
    MEMBER = 'MEMBER',
}

export class UpdateMemberRoleDto {
    @ApiProperty({ enum: OrganizationRole, example: OrganizationRole.MEMBER, description: 'Nuevo rol del miembro' })
    @IsEnum(OrganizationRole)
    role!: OrganizationRole;
}