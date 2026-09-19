import type { AuthRepository, LoginCredentials } from "@/src/modules/auth/domain/ports/auth-repository";
import { AuthSession } from "@/src/modules/auth/domain/models/auth-session";


export class Login {
    constructor(private readonly authRepository: AuthRepository) {}

    execute(credentials: LoginCredentials): Promise<AuthSession> {
    return this.authRepository.login(credentials);
    }
}