import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    NotFoundException,
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

    let organizationId = Array.isArray(organizationIdParam)
        ? organizationIdParam[0]
        : organizationIdParam;

    const projectIdParam = request.params.projectId;
    const projectId = Array.isArray(projectIdParam)
        ? projectIdParam[0]
        : projectIdParam;
    if (projectId) {
        const project = await this.prisma.client.project.findUnique({
            where: {
                id: projectId,
            },
            select: {
                organizationId: true,
            },
        });

        if (!project) {
            throw new NotFoundException("Proyecto no encontrado");
        }

        organizationId = project.organizationId;
    }

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