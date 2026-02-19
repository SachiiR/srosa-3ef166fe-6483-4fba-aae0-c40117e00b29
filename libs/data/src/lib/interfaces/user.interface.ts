import { Role } from "./../../index.js";

export interface User {
    id: number;
    username: string;
    password: string; 
    role: Role;
    organizationId: number;
    email: string;
  }