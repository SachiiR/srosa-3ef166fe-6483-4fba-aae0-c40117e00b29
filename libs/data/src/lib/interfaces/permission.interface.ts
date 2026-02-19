import { Role } from "./../../index.js";

export interface Permission {
    id: number;
    name: string; 
    role: Role;
  }