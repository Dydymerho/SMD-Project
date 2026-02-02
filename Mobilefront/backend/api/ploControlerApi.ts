// api/ploControlerApi.ts
import { PloControler } from '../types/PloControler';
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/ApiResponse';

export const PloControlerApi = {
    getPlo(): Promise<ApiResponse<PloControler[]>> {
        return axiosClient.get("/plos");
    },
    getAllMapping(): Promise<any> {
        return axiosClient.get("/clo-plo-mappings");
    }
};