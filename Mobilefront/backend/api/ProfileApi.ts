import axiosClient from "./axiosClient";
import { Profile } from "../types/Profile";
import { AxiosResponse } from "axios";

export const ProfileApi = {
    getMyProfile(): Promise<Profile> {
        return axiosClient.get("/auth/me");
    },
};
