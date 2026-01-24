import axiosClient from "./axiosClient";
import { LoginResponse } from "./types/auth";

export const authApi = {
    login: (
        username: string,
        password: string
    ): Promise<LoginResponse> =>
        axiosClient.post("/auth/login", {
            username,
            password,
        }),
};
