import type { AuthRepository } from "@/src/modules/auth/domain/ports/auth-repository";

export class Logout {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(refreshToken: string): Promise<void> {
    return this.authRepository.logout(refreshToken);
  }
}