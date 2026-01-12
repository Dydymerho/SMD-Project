import { StyleSheet } from "react-native"

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  contentContainer: {
    paddingBottom: 40,
    paddingHorizontal: 16,
  },

  /* ===== HEADER ===== */
  header: {
    paddingTop: 24,
    paddingBottom: 32,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 20,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },

  /* ===== ACTION TAG ===== */
  tag: {
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
    marginBottom: 32,
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
    fontSize: 16,
    fontWeight: "700",
    color: "#3B82F6",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  topic: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 4,
  },
  method: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "400",
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
