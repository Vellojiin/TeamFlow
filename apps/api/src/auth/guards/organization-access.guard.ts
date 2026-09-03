import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from "@nestjs/common";

import { PrismaService } from "../../database/prisma.service";
import { AuthenticatedRequest } from "../types/authenticated-request";

@Injectable()
export class OrganizationAccessGuard
    implements CanActivate
{
    constructor(
    private readonly prisma: PrismaService,
    ) {}

    async canActivate(
    context: ExecutionContext,
    ): Promise<boolean> {
    const request =
        context.switchToHttp().getRequest<AuthenticatedRequest>();

    const organizationIdParam =
        request.params.organizationId ??
        request.params.id;

    const organizationId = Array.isArray(organizationIdParam)
        ? organizationIdParam[0]
        : organizationIdParam;

    const userId = request.user.id;

    if (!organizationId) {
        throw new ForbiddenException(
        "Organization ID es requerido",
        );
    }

    const membership =
        await this.prisma.client.organizationMember.findFirst({
        where: {
            organizationId,
            userId,
        },
        });

    if (!membership) {
        throw new ForbiddenException(
        "No eres miembro de esta organización",
        );
    }

    return true;
    }
}