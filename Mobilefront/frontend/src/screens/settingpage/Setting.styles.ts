import { StyleSheet, Dimensions } from "react-native"

const { width } = Dimensions.get("window")

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F1F5F9", // Sử dụng xám nhạt tinh tế hơn làm nền
    },
    scrollContent: {
        paddingBottom: 120, // Tăng padding bottom để không bị che bởi Nav
    },
    // Hero Section
    heroCard: {
        backgroundColor: "#ffffff",
        marginHorizontal: 16,
        marginTop: -20, // Cho card trồi lên đè nhẹ lên Header
        borderRadius: 32, // Bo góc cực đại theo phong cách hiện đại
        padding: 32,
        alignItems: "center",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 6,
        borderColor: "#F8FAFC",
        marginBottom: 16,
    },
    userName: {
        fontSize: 24,
        fontWeight: "900", // Font đậm hơn cho sự chuyên nghiệp
        color: "#0F172A",
        letterSpacing: -0.5,
    },
    userRole: {
        fontSize: 14,
        color: "#64748B",
        marginTop: 6,
        fontWeight: "500",
        backgroundColor: "#F1F5F9",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 100,
    },
    // Section
    section: {
        backgroundColor: "#ffffff",
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 24,
        padding: 24,
        elevation: 2,
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: "#64748B",
        marginBottom: 12,
        marginLeft: 16,
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    // Info Row
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: "#F1F7FF", // Màu nền icon nhẹ nhàng hơn
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    infoLabel: {
        fontSize: 12,
        color: "#94A3B8",
        marginBottom: 4,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: "700",
        color: "#334155",
    },
    // Bullet / Course Item
    bullet: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 12,
        backgroundColor: "#F8FAFC",
        borderRadius: 16,
        marginBottom: 10,
    },
    bulletText: {
        fontSize: 15,
        color: "#1E293B",
        fontWeight: "600",
        flex: 1,
    },
    bulletIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    // Setting Item
    settingItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    settingItemLast: {
        borderBottomWidth: 0,
    },
    settingIconBox: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: "#F1F7FF",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1E293B",
        flex: 1,
    },
    settingValue: {
        fontSize: 14,
        color: "#94A3B8",
        marginRight: 8,
        fontWeight: "500",
    },
    // Bottom Navigation
    bottomNavContainer: {
        position: "absolute",
        bottom: 30,
        left: 24,
        right: 24,
    },
    bottomNav: {
        flexDirection: "row",
        backgroundColor: "#ffffff",
        borderRadius: 30,
        paddingVertical: 16,
        paddingHorizontal: 10,
        elevation: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        justifyContent: "space-around",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#F1F5F9",
    },
    navItem: {
        alignItems: "center",
        flex: 1,
    },
    navText: {
        fontSize: 11,
        marginTop: 4,
        color: "#94A3B8",
        fontWeight: "700",
    },
    navTextActive: {
        color: "#2563EB", // Xanh đậm hơn cho sự hiện đại
    },
    tag: {
        backgroundColor: "#3b82f6",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    tagText: {
        color: "#fff",
        fontWeight: "600",
    },
    profileSection: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 24,
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    avatarPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#2563EB",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "white",
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1E293B",
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 14,
        color: "#64748B",
    },

    // Sections



    destructiveIconBox: {
        backgroundColor: "#FEF2F2",
    },

    destructiveLabel: {
        color: "#EF4444",
    },

    // App Info
    appInfo: {
        alignItems: "center",
        marginTop: 32,
        paddingHorizontal: 16,
    },
    appVersion: {
        fontSize: 14,
        color: "#64748B",
        marginBottom: 4,
    },
    appCopyright: {
        fontSize: 12,
        color: "#94A3B8",
    }
})
