import type { User } from "@/src/modules/auth/domain/entities/user";
import type { AuthRepository } from "@/src/modules/auth/domain/ports/auth-repository";

export class GetCurrentUser {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(): Promise<User> {
    return this.authRepository.getCurrentUser();
  }
}