import type { User } from "../domain/entities/user";
import type { AuthRepository, RegisterData } from "../domain/ports/auth-repository";

export class Register {
    constructor(private readonly authRepository: AuthRepository) {}

    execute(data: RegisterData): Promise<User> {
    return this.authRepository.register(data);
    }
}