import { StyleSheet } from "react-native";

export default StyleSheet.create({
    // --- Container chính ---
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
    },
    loadingText: {
        marginTop: 10,
        color: "#64748B",
    },
    scrollContent: {
        padding: 16,
    },

    // --- Header ---
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    iconBox: {
        backgroundColor: '#DBEAFE',
        padding: 8,
        borderRadius: 8,
    },
    headerTextContainer: {
        marginLeft: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#0F172A",
    },
    headerSubtitle: {
        fontSize: 13,
        color: "#64748B",
    },
    unreadCount: {
        fontWeight: 'bold',
        color: '#2563EB',
    },

    // --- Empty State (Trống) ---
    emptyStateContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyStateText: {
        marginTop: 16,
        fontSize: 16,
        color: "#94A3B8",
    },

    // --- Section Header (Hôm nay, Trước đó) ---
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#334155",
        marginBottom: 12,
        marginTop: 4,
    },
    sectionMarginTop: {
        marginTop: 16,
    },

    // --- Card Thông báo (Item) ---
    card: {
        flexDirection: "row",
        padding: 14,
        borderRadius: 12,
        marginBottom: 12,
    },
    // Trạng thái ĐÃ ĐỌC
    cardRead: {
        backgroundColor: "#FFFFFF",
        elevation: 1,
        borderLeftWidth: 0,
    },
    // Trạng thái CHƯA ĐỌC
    cardUnread: {
        backgroundColor: "#EBF5FF",
        elevation: 2,
        borderLeftWidth: 4,
        borderLeftColor: "#2563EB",
    },

    // --- Nội dung bên trong Card ---
    cardIconContainer: {
        marginRight: 12,
        marginTop: 2,
    },
    cardContent: {
        flex: 1,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cardTitle: {
        fontSize: 15,
        marginBottom: 4,
        flex: 1,
        color: "#1E293B",
    },
    textBold: {
        fontWeight: "700",
    },
    textNormal: {
        fontWeight: "600",
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#2563EB',
        marginTop: 6,
    },
    cardMessage: {
        fontSize: 13,
        color: "#64748B",
        marginBottom: 6,
    },

    // --- Dòng thời gian ---
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    clockIcon: {
        marginRight: 4,
    },
    timeText: {
        fontSize: 11,
        color: "#94A3B8",
    },
});