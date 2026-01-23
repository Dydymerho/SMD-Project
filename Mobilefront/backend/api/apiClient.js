import axios from 'axios'


const apiClient = axios.create({
    baseURL: 'http://192.168.1.10:8080', // IP máy bạn
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

export default apiClient
