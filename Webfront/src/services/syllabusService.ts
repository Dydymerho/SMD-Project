import axiosClient from '../api/axiosClient';

export const fetchAllSyllabuses = () => {
    return axiosClient.get('/syllabuses'); 
};