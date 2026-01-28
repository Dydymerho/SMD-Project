
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import thư viện
const API_BASE_URL = 'http://10.0.2.2:9090/api';
export const InteractionService = {
    toggleFollow: async (courseId: number | string, isCurrentlyFollowed: boolean) => {
        // Thay localStorage bằng AsyncStorage (Lưu ý phải có await)
        const token = await AsyncStorage.getItem('accessToken');
        const method = isCurrentlyFollowed ? 'DELETE' : 'POST';

        // Endpoint giống hệt nhau, chỉ khác Method
        const url = `${API_BASE_URL}/api/courses/${courseId}/follow`;

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    // Quan trọng: Phải gửi kèm Token vì API có hình cái khóa
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Lỗi khi cập nhật trạng thái follow');
            }

            return true; // Thành công
        } catch (error) {
            console.error(error);
            return false; // Thất bại
        }
    }
};