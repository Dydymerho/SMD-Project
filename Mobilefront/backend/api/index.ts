// Export tất cả các file API bạn đang có
export * from './AssessmentApi';
export * from './authApi';
export * from './CourseApi';
export * from './DetailSyllabusApi';
export * from './MateriaApi';      // Lưu ý: Tên file gốc của bạn đang thiếu chữ 'l'
export * from './ploControlerApi';
export * from './ProfileApi';
export * from './SesssionPlanApi'; // Lưu ý: Tên file gốc của bạn đang thừa chữ 's'
export * from './ReportApi';
export * from './CourseInteractionApi'; // <--- Thêm dòng này
export * from './PloCloMapping'
export { default as axiosClient } from './axiosClient';
