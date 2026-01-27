import { StyleSheet } from "react-native"

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: "#FFFFFF",
  },
  contentContainer: {
    paddingBottom: 60,
    paddingHorizontal: 16,
    paddingRight: 18,
    paddingLeft: 18,
  },

  /* ===== HEADER ===== */
  header: {
    backgroundColor: "#ffffff", // tím đậm
    marginHorizontal: -16,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
  },
  code: {
    color: "#E0E7FF",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 2,
  },
  subtitle: {
    color: "#DAD7FF",
    fontSize: 12,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },

  /* ===== ACTION TAG ===== */
  tag: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#E0E7FF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  tagText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3B82F6",
  },

  /* ===== SECTION ===== */
  section: {
    marginTop: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 16,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  outcomeItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },

  outcomeBadge: {
    backgroundColor: "#E6F0FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 12,
  },

  outcomeBadgeText: {
    color: "#2D5BFF",
    fontWeight: "700",
    fontSize: 12,
  },

  outcomeText: {
    flex: 1,
    color: "#333",
    fontSize: 14,
    lineHeight: 20,
  },

  /* ===== INFO ROW ===== */
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1E293B",
    flex: 1,
    textAlign: "right",
  },
  missionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    textAlign: 'justify',
  },
  /* ===== BULLET ===== */
  bullet: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 10,
    marginBottom: 8,
    fontWeight: "400",
  },

  /* ===== TEACHING PLAN ROW ===== */
  teachingPlanRow: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
  week: {
    fontSize: 14,
    fontWeight: "700",
    color: "#3B82F6",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  topic: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 4,
  },
  method: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "400",
  },
  missions: {
    fontSize: 12,
    color: "#0F172A",
  },
  /* ===== TREE & MAPPING ===== */
  treeTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 16,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  linkText: {
    fontSize: 16,
    color: "#3B82F6",
    fontWeight: "500",
    marginBottom: 8,
    paddingVertical: 4,
  },
  mapping: {
    fontSize: 16,
    color: "#475569",
    marginBottom: 8,
    lineHeight: 20,
    fontWeight: "400",
  },
  cloCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },

  cloTitle: {
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 8,
  },

  ploRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  ploBadge: {
    backgroundColor: "#E6F0FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },

  ploText: {
    color: "#2D5BFF",
    fontWeight: "600",
    fontSize: 12,
  },

  /* ===== REPORT BUTTON ===== */
  reportBtn: {
    paddingHorizontal: 30,
    paddingVertical: 10,
    backgroundColor: '#FFF0F0',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFD1D1',
    marginLeft: 0,
    alignItems: 'center',
    marginTop: 4
  },
  reportText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#DC2626",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Nền tối mờ
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalView: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1E293B',
    textAlign: 'center'
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    textAlign: 'center'
  },
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    height: 100,
    textAlignVertical: 'top', // Để text nằm trên cùng (Android)
    fontSize: 16,
    color: '#333',
    marginBottom: 20
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  buttonCancel: {
    backgroundColor: '#F1F5F9',
  },
  buttonConfirm: {
    backgroundColor: '#EF4444', // Màu đỏ báo cáo
  },
  textCancel: {
    color: '#64748B',
    fontWeight: '600'
  },
  textConfirm: {
    color: 'white',
    fontWeight: '600'
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 8,
    minWidth: 110,
  },
  followBtnInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  followBtnActive: {
    backgroundColor: '#FFF',
  },
  followBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  followTextInactive: {
    color: '#FFF',
  },
  followTextActive: {
    color: '#4F1CFF',
  }
})

export default styles
