import axiosClient from "./axiosClient";
import { Courses } from "./types/Courses";

export const CourseApi = {
    getMySyllabus(): Promise<Courses[]> {
        return axiosClient.get("/courses");
        // → http://10.0.2.2:9090/api/v1/syllabus
    },
};
