import type { User } from "@/src/modules/auth/domain/entities/user";
import type { AuthRepository, RegisterData } from "@/src/modules/auth/domain/ports/auth-repository";

export class Register {
    constructor(private readonly authRepository: AuthRepository) {}

    execute(data: RegisterData): Promise<User> {
    return this.authRepository.register(data);
    }
}