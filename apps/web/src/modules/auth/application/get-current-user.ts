import type { User } from "../domain/entities/user";
import type { AuthRepository } from "../domain/ports/auth-repository";

export class GetCurrentUser {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(): Promise<User> {
    return this.authRepository.getCurrentUser();
  }
}