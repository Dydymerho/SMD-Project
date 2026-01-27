import { StyleSheet } from "react-native"

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: "#FFFFFF",
  },
  contentContainer: {
    paddingBottom: 40,
    paddingHorizontal: 16,
    paddingRight: 18,
    paddingLeft: 18,
  },

  /* ===== HEADER ===== */
  header: {
    backgroundColor: "#4F1CFF", // tím đậm
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
    fontSize: 16,
    color: "#475569",
    lineHeight: 22,
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
    fontSize: 18,
    fontWeight: "700",
    color: "#3B82F6",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  topic: {
    fontSize: 18,
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
    fontSize: 16,
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
    marginTop: 16,
    marginHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 40,
  },
  reportText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#DC2626",
    textAlign: "center",
  },
})

export default styles
