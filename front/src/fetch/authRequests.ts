import type { LoginDTO, LoginResponseDTO, RegisterDTO } from "@/dto/AuthDTO";
import { apiRequest } from "@/fetch/api";

export function login(credentials: LoginDTO) {
  return apiRequest<LoginResponseDTO>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials)
  });
}

export function register(input: RegisterDTO) {
  return apiRequest<LoginResponseDTO>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input)
  });
}
