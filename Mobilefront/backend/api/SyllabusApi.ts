import axiosClient from './axiosClient';
import { Alert, Platform, PermissionsAndroid } from 'react-native';
import RNFS from 'react-native-fs';

export const SyllabusApi = {
  /**
   * Download PDF syllabus file
   * @param syllabusId - The ID of the syllabus to download
   * @returns Promise<string> - The file path where PDF was saved
   */
  downloadPdf: async (syllabusId: number): Promise<string> => {
    try {
      // Request storage permission on Android
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Quyền lưu file',
            message: 'Ứng dụng cần quyền để lưu file PDF',
            buttonNeutral: 'Hỏi lại sau',
            buttonNegative: 'Hủy',
            buttonPositive: 'Đồng ý',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          throw new Error('Không có quyền lưu file');
        }
      }

      // Call API to download PDF
      const response = await axiosClient.get(
        `/syllabuses/${syllabusId}/download-pdf`,
        {
          responseType: 'blob',
        },
      );

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers?.['content-disposition'];
      let filename = `syllabus_${syllabusId}.pdf`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
        );
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      // Determine download path based on platform
      const downloadPath =
        Platform.OS === 'ios'
          ? `${RNFS.DocumentDirectoryPath}/${filename}`
          : `${RNFS.DownloadDirectoryPath}/${filename}`;

      // Convert blob to base64 and save
      const reader = new FileReader();

      return new Promise((resolve, reject) => {
        reader.onloadend = async () => {
          try {
            const base64Data = (reader.result as string).split(',')[1];
            await RNFS.writeFile(downloadPath, base64Data, 'base64');
            resolve(downloadPath);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(response.data);
      });
    } catch (error) {
      console.error('Download PDF Error:', error);
      throw error;
    }
  },
};
