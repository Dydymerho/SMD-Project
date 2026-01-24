import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi } from "./authApi";
import { LoginResponse } from "./types/auth";

/* ===== TYPE RESPONSE (theo backend) ===== */

async function testLogin() {
    try {
        const res: LoginResponse = await authApi.login(
            "lecturer",
            "Password123"
        );

        console.log("✅ Login thành công");
        console.log("Token:", res.token);
        console.log("User:", res.user);

        // 🔐 Lưu token cho interceptor dùng
        await AsyncStorage.setItem("AUTH_TOKEN", res.token);

        console.log("✅ Token đã lưu vào AsyncStorage");

    } catch (err: any) {
        console.log("❌ Login thất bại");

        if (err.response) {
            console.log("Status:", err.response.status);
            console.log("Data:", err.response.data);
        } else {
            console.log("Message:", err.message);
        }
    }
}

testLogin();
