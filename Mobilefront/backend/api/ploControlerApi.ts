import { PloControler } from '../types/PloControler';
import { AxiosResponse } from 'axios';
import axiosClient from '../api/axiosClient';
import { ApiResponse } from '../../backend/types/ApiResponse';
export const PloControlerApi = {
    getPlo(): Promise<AxiosResponse<ApiResponse<PloControler>>> {
        return axiosClient.get("/plos");
    },
};