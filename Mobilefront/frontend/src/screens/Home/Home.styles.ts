import { StyleSheet, Platform, StatusBar } from "react-native";

const styles = StyleSheet.create({
    // LAYOUT CHUNG
    safe: {
        flex: 1,
        backgroundColor: "#F1F5F9", // Nền xám nhạt (Slate-100)
    },
    container: {
        paddingBottom: 100, // Chừa khoảng trống cuộn
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F1F5F9",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: "#64748B",
        fontWeight: "500",
    },

    /* ===== HEADER SECTION ===== */
    header: {
        backgroundColor: "#20331b", // Màu chủ đạo cũ (hoặc dùng Gradient ở component)
        paddingTop: Platform.OS === 'android' ? 20 : 10,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        // Shadow
        shadowColor: "#20331b",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
        marginBottom: 20,
    },
    greeting: {
        fontSize: 24,
        fontWeight: "800",
        color: "#FFFFFF",
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    subText: {
        fontSize: 14,
        color: "#CBD5E1", // Slate-300
        marginBottom: 20,
        fontWeight: "500",
    },

    /* SEARCH BAR */
    searchWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.15)", // Glassmorphism
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: Platform.OS === 'ios' ? 12 : 4,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    searchIcon: {
        marginRight: 10,
    },
    SearchBar: {
        flex: 1,
        fontSize: 16,
        color: "#FFFFFF",
        fontWeight: "500",
    },

    /* ===== CONTENT SECTION ===== */
    content: {
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: "#1E293B", // Slate-800
        marginBottom: 16,
        letterSpacing: 0.5,
    },

    /* ===== FILTER BAR ===== */
    filterRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    filterButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        // Shadow nhẹ
        shadowColor: "#64748B",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    filterButtonText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: "700",
        color: "#0F172A",
    },
    clearFilterButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FEE2E2", // Red-50
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    clearFilterText: {
        fontSize: 12,
        color: "#EF4444", // Red-500
        fontWeight: "600",
        marginRight: 6,
    },
    activeFilters: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 20,
    },
    filterChip: {
        backgroundColor: "#E0F2FE", // Sky-100
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#BAE6FD",
    },
    filterChipText: {
        fontSize: 12,
        color: "#0284C7", // Sky-600
        fontWeight: "600",
    },

    /* ===== COURSE LIST ===== */
    courseList: {
        gap: 16, // Khoảng cách giữa các card
    },

    /* EMPTY STATE */
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 60,
        opacity: 0.7,
    },
    emptyText: {
        fontSize: 16,
        color: "#64748B",
        marginTop: 16,
        textAlign: "center",
        maxWidth: "80%",
    },
    clearSearchButton: {
        marginTop: 20,
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: "#3b82f6",
        borderRadius: 12,
    },
    clearSearchText: {
        color: "#FFF",
        fontWeight: "700",
    },

    /* ERROR STATE */
    errorContainer: {
        alignItems: "center",
        marginVertical: 20,
        backgroundColor: "#FEF2F2",
        padding: 20,
        borderRadius: 16,
        marginHorizontal: 20,
    },
    errorText: {
        fontSize: 14,
        color: "#EF4444",
        marginTop: 10,
        textAlign: "center",
    },
    retryButton: {
        marginTop: 12,
        paddingVertical: 8,
        paddingHorizontal: 20,
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#FECACA",
    },
    retryButtonText: {
        fontSize: 13,
        color: "#DC2626",
        fontWeight: "700",
    },

    /* ===== MODAL ===== */
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(15, 23, 42, 0.6)", // Slate-900 transparent
        justifyContent: "flex-end", // Bottom sheet style
    },
    filterModal: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: "80%",
    },
    filterHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    filterTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: "#1E293B",
    },
    filterContent: {
        marginBottom: 20,
    },
    filterSection: {
        marginBottom: 24,
    },
    filterSectionTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#64748B",
        marginBottom: 12,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    filterDropdown: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    filterDropdownText: {
        fontSize: 15,
        color: "#334155",
        fontWeight: "500",
    },
    filterList: {
        marginTop: 8,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        maxHeight: 200, // Scrollable
        overflow: 'scroll'
    },
    filterOption: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    filterOptionSelected: {
        backgroundColor: "#F0F9FF",
    },
    filterOptionText: {
        fontSize: 15,
        color: "#334155",
    },
    filterOptionTextSelected: {
        color: "#0284C7",
        fontWeight: "700",
    },
    filterFooter: {
        flexDirection: "row",
        gap: 16,
        marginTop: 10,
    },
    filterCancelButton: {
        flex: 1,
        paddingVertical: 14,
        backgroundColor: "#F1F5F9",
        borderRadius: 12,
        alignItems: "center",
    },
    filterCancelText: {
        color: "#64748B",
        fontWeight: "700",
        fontSize: 15,
    },
    filterApplyButton: {
        flex: 1,
        paddingVertical: 14,
        backgroundColor: "#3b82f6",
        borderRadius: 12,
        alignItems: "center",
        // Shadow
        shadowColor: "#3b82f6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    filterApplyText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 15,
    },

    /* ===== COURSE CARD COMPONENT ===== */
    courseCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        marginBottom: 20,
        // Shadow cao cấp
        shadowColor: "#64748B",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: "rgba(226, 232, 240, 0.6)", // Slate-200
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    codeBadge: {
        backgroundColor: "#DCFCE7", // Green-100
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginRight: 12,
        borderWidth: 1,
        borderColor: "#86EFAC", // Green-300
    },
    codeText: {
        fontSize: 12,
        fontWeight: "800",
        color: "#15803D", // Green-700
    },
    courseTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: "700",
        color: "#1E293B", // Slate-800
        lineHeight: 22,
    },
    cardBody: {
        padding: 16,
    },
    courseInfoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    courseInfoText: {
        fontSize: 14,
        color: "#64748B", // Slate-500
        marginLeft: 10,
        flex: 1,
    },
    descriptionBox: {
        marginTop: 12,
        padding: 12,
        backgroundColor: "#F8FAFC", // Slate-50
        borderRadius: 12,
    },
    descriptionTitle: {
        fontSize: 12,
        fontWeight: "700",
        color: "#475569",
        marginBottom: 4,
        textTransform: "uppercase",
    },
    descriptionText: {
        fontSize: 13,
        color: "#64748B",
        lineHeight: 18,
        fontStyle: 'italic',
    },
    cardFooter: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
    },
    viewDetailText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#007AFF",
        marginRight: 4,
    },
});

export default styles;