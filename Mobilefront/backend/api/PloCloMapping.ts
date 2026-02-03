// api/CloPloMappingApi.ts
import axiosClient from './axiosClient';

export const CloPloMappingApi = {
    getAllMappings(): Promise<any[]> {
        return axiosClient.get("/clo-plo-mappings");
    },
};