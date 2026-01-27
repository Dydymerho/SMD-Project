// api/DetailSyllabusApi.ts
import { syllabus } from '../types/syllabusDetail';
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/ApiResponse';

export const syllabusDetailApi = {

    getSyllabusDetail(): Promise<ApiResponse<syllabus[]>> {
        return axiosClient.get("/syllabuses");
    },
};