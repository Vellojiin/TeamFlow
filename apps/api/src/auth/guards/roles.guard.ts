import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { PrismaService } from "../../database/prisma.service";
import { AuthenticatedRequest } from "../types/authenticated-request";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
        "roles",
        [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
        return true;
    }

    const request =
        context.switchToHttp().getRequest<AuthenticatedRequest>();

    const userId = request.user.id;
    const organizationId = Array.isArray(request.params?.id)
        ? request.params.id[0]
        : request.params?.id;

    if (!organizationId) {
        throw new ForbiddenException(
        "Organization ID es requerida",
        );
    }

    const membership =
        await this.prisma.client.organizationMember.findFirst({
        where: {
            organizationId: organizationId,
            userId,
        },
        });

    if (!membership) {
        throw new ForbiddenException(
        "No eres miembro de esta organización",
        );
    }

    if (!requiredRoles.includes(membership.role)) {
        throw new ForbiddenException(
        "No tienes permiso para realizar esta acción",
        );
    }

    return true;
    }
}