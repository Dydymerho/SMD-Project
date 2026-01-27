import axiosClient from "./axiosClient";
import { Courses } from "../types/Courses";

export const CourseApi = {
    getMySyllabus(): Promise<Courses[]> {
        return axiosClient.get("/syllabuses");
    },
};
