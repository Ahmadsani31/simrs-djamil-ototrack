export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  name: string;
}

export interface LoginData {
    email: string;
    password: string;
  }

  export interface RegisterData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }



export interface Todo {
  id: string;
  title: string;
  completed: boolean;
}
