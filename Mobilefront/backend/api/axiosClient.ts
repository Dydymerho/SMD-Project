import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* ================= CONFIG ================= */

const axiosClient = axios.create({
    baseURL: "http://10.0.2.2:9090/api/v1", // ⚠️ đổi IP cho đúng
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

/* ================= REQUEST INTERCEPTOR ================= */

axiosClient.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem("AUTH_TOKEN");

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

/* ================= RESPONSE INTERCEPTOR ================= */

axiosClient.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        const status = error.response?.status;

        console.log("API Error:", {
            status,
            url: error.config?.url,
            message: error.response?.data || error.message,
        });

        // ❌ Unauthorized → logout
        if (status === 401) {
            await AsyncStorage.removeItem("AUTH_TOKEN");
            // TODO: navigate to Login
        }

        return Promise.reject(error);
    }
);

export default axiosClient;
