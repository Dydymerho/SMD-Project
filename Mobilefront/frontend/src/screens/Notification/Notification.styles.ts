import { StyleSheet, Platform } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC", // Slate-50 background
    },

    /* ===== HEADER GRADIENT ===== */
    headerGradient: {
        height: 100,
        paddingTop: Platform.OS === 'ios' ? 50 : 30, // Căn chỉnh lại padding top
        alignItems: 'center',
        justifyContent: 'flex-start', // Đẩy nội dung lên trên thay vì center
        borderBottomLeftRadius: 32, // Bo góc nhẹ hơn một chút cho thanh thoát
        borderBottomRightRadius: 32,
        zIndex: 1,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20, // Tăng size chữ (cũ là 18)
        fontWeight: '800', // Đậm hơn
        color: '#FFFFFF',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 30,
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#E2E8F0", // Slate-200
        marginTop: 4,
        fontWeight: "500",
    },
    unreadBadge: {
        backgroundColor: "rgba(255,255,255,0.2)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
    },
    unreadText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 12,
    },

    /* ===== CONTENT LIST ===== */
    scrollContent: {
        paddingTop: 20,
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#64748B", // Slate-500
        textTransform: "uppercase",
        letterSpacing: 1,
        marginLeft: 8,
    },
    sectionLine: {
        height: 1,
        backgroundColor: "#E2E8F0",
        flex: 1,
        marginLeft: 12,
    },

    /* ===== NOTIFICATION CARD ===== */
    card: {
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        // Shadow
        shadowColor: "#64748B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: "transparent",
    },
    cardUnread: {
        backgroundColor: "#F0F9FF", // Sky-50 (Nền xanh rất nhạt cho tin chưa đọc)
        borderColor: "#BAE6FD", // Viền xanh nhạt
    },
    cardRead: {
        backgroundColor: "#FFFFFF",
        borderColor: "#F1F5F9",
    },

    /* Icon Box bên trái */
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },

    /* Nội dung bên phải */
    contentContainer: {
        flex: 1,
        justifyContent: "center",
    },
    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 4,
    },
    titleText: {
        fontSize: 15,
        color: "#1E293B", // Slate-800
        flex: 1,
        marginRight: 8,
        lineHeight: 20,
    },
    titleBold: {
        fontWeight: "700", // Chưa đọc thì đậm
    },
    titleNormal: {
        fontWeight: "600", // Đã đọc thì thường
    },

    /* Chấm xanh đánh dấu chưa đọc */
    blueDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#3b82f6",
        marginTop: 6,
    },

    messageText: {
        fontSize: 13,
        color: "#64748B", // Slate-500
        lineHeight: 18,
        marginBottom: 8,
    },

    /* Dòng thời gian */
    footerRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    timeText: {
        fontSize: 12,
        color: "#94A3B8", // Slate-400
        marginLeft: 4,
        fontWeight: "500",
    },
    courseTag: {
        backgroundColor: "#F1F5F9",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 8,
    },
    courseTagText: {
        fontSize: 10,
        color: "#475569",
        fontWeight: "600",
    },

    /* ===== EMPTY STATE ===== */
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 80,
        opacity: 0.5,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: "#64748B",
        fontWeight: "500",
    },

    /* LOADING */
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
    },
});

export default styles;