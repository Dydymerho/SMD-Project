import { StyleSheet, Dimensions } from "react-native"

const { width } = Dimensions.get("window")

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },
    scrollContent: {
        paddingBottom: 80,
    },
    // Hero Section
    heroCard: {
        backgroundColor: "#ffffff",
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 24,
        padding: 24,
        alignItems: "center",
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: "#ffffff",
        marginBottom: 12,
    },
    userName: {
        fontSize: 22,
        fontWeight: "800",
        color: "#1e293b",
    },
    userRole: {
        fontSize: 14,
        color: "#64748b",
        marginTop: 4,
    },
    // Section
    section: {
        backgroundColor: "#ffffff",
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 24,
        padding: 20,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1e293b",
        marginBottom: 16,
    },
    // Info Row
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#eff6ff",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    infoLabel: {
        fontSize: 12,
        color: "#64748b",
        marginBottom: 2,
        fontWeight: "500",
    },
    infoValue: {
        fontSize: 15,
        fontWeight: "600",
        color: "#334155",
    },
    // Bullet / Course Item
    bullet: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    bulletText: {
        fontSize: 14,
        color: "#334155",
        fontWeight: "500",
        flex: 1,
    },
    bulletIcon: {
        marginRight: 12,
    },
    // Bottom Navigation
    bottomNavContainer: {
        position: "absolute",
        bottom: 24,
        left: 20,
        right: 20,
    },

    navItem: {
        alignItems: "center",
    },
    navText: {
        fontSize: 10,
        marginTop: 4,
        color: "#94a3b8",
        fontWeight: "700",
    },
    navTextActive: {
        color: "#3b82f6",
    },
    viewAllBtn: {
        marginTop: 12,
        alignItems: 'center',
    },
    viewAllText: {
        color: '#3b82f6',
        fontWeight: '600',
    },

})
