import axiosClient from "./axiosClient";
import { Profile } from "../types/Profile";


export const ProfileApi = {
    getMyProfile(): Promise<Profile> {
        return axiosClient.get("/auth/me");
    },
};
