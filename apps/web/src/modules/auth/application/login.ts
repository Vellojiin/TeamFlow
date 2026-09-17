import type { AuthRepository, LoginCredentials } from "../domain/ports/auth-repository";
import { AuthSession } from "../domain/models/auth-session";


export class Login {
    constructor(private readonly authRepository: AuthRepository) {}

    execute(credentials: LoginCredentials): Promise<AuthSession> {
    return this.authRepository.login(credentials);
    }
}