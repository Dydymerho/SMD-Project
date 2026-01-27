import { Material } from '../types/Material';
import { AxiosResponse } from 'axios';
import axiosClient from '../api/axiosClient';
import { ApiResponse } from '../../backend/types/ApiResponse';
export const MaterialApi = {
    gerMaterial(): Promise<AxiosResponse<ApiResponse<Material>>> {
        return axiosClient.get("/materials");
    },
};