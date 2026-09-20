import type { User } from "@/src/modules/auth/domain/user.model";

export interface OrganizationMember {
    id: string;
    userId: string;
    organizationId: string;
    role: "OWNER" | "ADMIN" | "MEMBER";
    user: User;
    createdAt: Date;
}