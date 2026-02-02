import { StyleSheet, Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9', // Nền xám nhạt hiện đại (Slate-100)
  },
  contentContainer: {
    paddingBottom: 80,
  },

  /* ===== HEADER GRADIENT ===== */
  header: {
    // Gradient giữ nguyên màu cũ nhưng tăng padding để thoáng hơn
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 30,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 8,
    shadowColor: '#20331b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    marginBottom: 20,
  },
  code: {
    color: '#86efac', // Xanh lá sáng nhẹ (Green-300) tạo điểm nhấn trên nền tối
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 30,
    marginBottom: 4,
  },
  subtitle: {
    color: '#E2E8F0', // Slate-200
    fontSize: 14,
    fontWeight: '500',
  },

  /* ===== FOLLOW BUTTON ===== */
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100, // Bo tròn hoàn toàn (Pill shape)
    marginTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Glassmorphism nhẹ
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  followBtnActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  followBtnInactive: {
    // Dùng style mặc định ở trên
  },
  followBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  followTextInactive: {
    color: '#FFFFFF',
  },
  followTextActive: {
    color: '#15803d', // Màu xanh đậm của header
  },

  /* ===== DOWNLOAD BUTTON ===== */
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
    backgroundColor: '#2563EB',
    borderWidth: 1,
    borderColor: '#1E40AF',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  downloadButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },

  /* ===== COMMON CARD (SECTION) ===== */
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 24, // Bo góc lớn hiện đại
    padding: 20,
    // Shadow mềm mại
    elevation: 2,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#334155', // Slate-700
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6', // Line xanh điểm nhấn bên cạnh tiêu đề
    paddingLeft: 12,
  },

  /* ===== TEXT CONTENT ===== */
  missionText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#475569', // Slate-600
    textAlign: 'justify',
  },

  /* ===== INFO ROW ===== */
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8', // Slate-400
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B', // Slate-800
    textAlign: 'right',
    flex: 1,
    marginLeft: 20,
  },

  /* ===== DIAGRAM MAP ===== */
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF', // Sky-50
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD', // Sky-200
    borderStyle: 'dashed',
  },
  toggleBtnText: {
    color: '#0284C7', // Sky-600
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 8,
  },
  diagramContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
    minHeight: 200,
    position: 'relative',
  },
  svgLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  column: {
    width: '45%',
    alignItems: 'center',
  },
  colTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  node: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  ploNode: {
    borderColor: '#BFDBFE', // Blue-200
    backgroundColor: '#EFF6FF', // Blue-50
  },
  cloNode: {
    borderColor: '#BBF7D0', // Green-200
    backgroundColor: '#F0FDF4', // Green-50
  },
  nodeTitle: {
    fontWeight: '800',
    fontSize: 13,
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
  },
  nodeDesc: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 14,
  },

  /* ===== TIMELINE TEACHING PLAN (NEW DESIGN) ===== */
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 0, // Sát nhau để nối dây
  },
  timelineLeft: {
    width: 60,
    alignItems: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0', // Slate-200
    marginVertical: 4,
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3b82f6', // Primary Blue
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#DBEAFE', // Blue-100 ring
    zIndex: 1,
  },
  weekNum: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  timelineContent: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Slate-50
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    marginLeft: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  topic: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  method: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
  },

  /* ===== DOCUMENTS & ASSESSMENT ===== */
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
  },
  bulletIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#CBD5E1',
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 12,
    marginTop: 2,
  },
  bulletContent: {
    flex: 1,
  },
  bulletTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    lineHeight: 20,
  },
  bulletSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },

  /* ===== REPORT BUTTON & MODAL ===== */
  reportBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FEF2F2', // Red-50
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  reportText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
  },

  // Modal giữ nguyên style cũ vì nó là overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)', // Darker overlay
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalView: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    color: '#1E293B',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 16,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 15,
    color: '#333',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonCancel: {
    backgroundColor: '#F1F5F9',
  },
  buttonConfirm: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  textCancel: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: 15,
  },
  textConfirm: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default styles;
