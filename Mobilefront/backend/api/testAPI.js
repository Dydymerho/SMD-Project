import apiClient from './apiClient.js'

async function testApiClient() {
    try {
        const response = await apiClient.get('/api/subjects')

        console.log('✅ Kết nối thành công')
        console.log('Status:', response.status)
        console.log('Data:', response.data)
    } catch (error) {
        console.error('❌ Lỗi khi gọi API')

        if (error.response) {
            // Backend trả về nhưng lỗi (404, 500...)
            console.error('Status:', error.response.status)
            console.error('Data:', error.response.data)
        } else {
            // Không kết nối được backend
            console.error('Message:', error.message)
        }
    }
}

testApiClient()
