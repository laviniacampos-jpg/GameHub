export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponseDTO {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: "admin" | "student";
  };
}
