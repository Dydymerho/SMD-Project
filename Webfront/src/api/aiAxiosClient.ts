import axios from "axios";

const aiAxiosClient = axios.create({
  baseURL: "http://localhost:9090",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

aiAxiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("AI Service Error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  },
);

export default aiAxiosClient;
