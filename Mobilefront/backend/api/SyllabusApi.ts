// backend/api/SyllabusApi.ts
import axiosClient from './axiosClient';
import { Platform, PermissionsAndroid } from 'react-native';
import RNFS from 'react-native-fs';

export const SyllabusApi = {
  downloadPdf: async (syllabusId: number): Promise<string> => {
    try {
      // 1. Xin quyền ghi file trên Android
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          throw new Error('Quyền truy cập bộ nhớ bị từ chối');
        }
      }

      // 2. Gọi API lấy file
      const response = await axiosClient.get(
        `/syllabuses/${syllabusId}/download-pdf`,
        { responseType: 'blob' }
      );

      // 3. Xử lý tên file
      const contentDisposition = response.headers?.['content-disposition'];
      let filename = `syllabus_${syllabusId}.pdf`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch?.[1]) filename = filenameMatch[1].replace(/['"]/g, '');
      }

      // 4. Xác định đường dẫn lưu trữ
      const downloadPath = Platform.OS === 'ios'
        ? `${RNFS.DocumentDirectoryPath}/${filename}`
        : `${RNFS.DownloadDirectoryPath}/${filename}`;

      // 5. Chuyển đổi Blob sang Base64 và lưu file
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onloadend = async () => {
          try {
            const base64Data = (reader.result as string).split(',')[1];
            await RNFS.writeFile(downloadPath, base64Data, 'base64');
            resolve(downloadPath);
          } catch (error) {
            reject(new Error('Lỗi khi lưu file vào bộ nhớ'));
          }
        };
        reader.onerror = () => reject(new Error('Lỗi khi đọc dữ liệu PDF'));
        reader.readAsDataURL(response.data);
      });
    } catch (error) {
      console.error('Download PDF Error:', error);
      throw error;
    }
  },
};