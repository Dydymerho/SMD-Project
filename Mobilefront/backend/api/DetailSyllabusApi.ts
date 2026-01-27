import { syllabus } from '../types/syllabusDetail';
import { AxiosResponse } from 'axios';
import axiosClient from '../api/axiosClient';
import { ApiResponse } from '../../backend/types/ApiResponse';
export const syllabusDetailApi = {
    getSyllabusDetail(): Promise<AxiosResponse<ApiResponse<syllabus>>> {
        return axiosClient.get("/syllabuses");
    },
};