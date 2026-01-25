// src/types/auth.ts
export type LoginResponse = {
    token: string;
    user: {
        id: number;
        username: string;
        role: string;
    };
};
