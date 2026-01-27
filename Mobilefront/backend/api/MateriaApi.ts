import { Material } from '../types/Material';
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/ApiResponse';

export const MaterialApi = {
    getMaterial(): Promise<ApiResponse<Material[]>> {
        return axiosClient.get("/materials");
    },
};