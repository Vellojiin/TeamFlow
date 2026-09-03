import { Request } from "express";

export interface AuthenticatedUser {
    id: string;
    email: string;
    name: string | null;
    createdAt: Date;
}

export interface AuthenticatedRequest extends Request {
    user: AuthenticatedUser;
}