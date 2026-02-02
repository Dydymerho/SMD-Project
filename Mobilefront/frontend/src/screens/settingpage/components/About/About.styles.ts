import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC", // Nền xám nhạt (Slate-50)
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },

    /* ===== HEADER SECTION (LOGO) ===== */
    headerContainer: {
        alignItems: "center",
        marginBottom: 30,
        marginTop: 10,
    },
    logoBox: {
        width: 80,
        height: 80,
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
        // Shadow
        shadowColor: "#3B82F6",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
        borderWidth: 1,
        borderColor: "#EFF6FF",
    },
    appName: {
        fontSize: 24,
        fontWeight: "800",
        color: "#1E293B", // Slate-800
        letterSpacing: 0.5,
    },
    versionBadge: {
        marginTop: 6,
        backgroundColor: "#E2E8F0",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    versionText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#64748B",
    },

    /* ===== CARD SECTION ===== */
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        // Shadow
        shadowColor: "#64748B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
        paddingBottom: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#334155", // Slate-700
        marginLeft: 10,
    },

    // Text Content
    descriptionText: {
        fontSize: 14,
        lineHeight: 22,
        color: "#475569", // Slate-600
        textAlign: "justify",
    },

    // Feature List
    featureItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    featureText: {
        flex: 1,
        fontSize: 14,
        color: "#475569",
        marginLeft: 10,
        lineHeight: 20,
    },

    // Contact Row
    contactRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        backgroundColor: "#F8FAFC",
        borderRadius: 12,
        paddingHorizontal: 12,
        marginTop: 8,
    },
    contactText: {
        marginLeft: 10,
        fontSize: 14,
        fontWeight: "600",
        color: "#2563EB", // Link color
    },

    /* ===== FOOTER ===== */
    footer: {
        alignItems: "center",
        marginTop: 10,
    },
    footerText: {
        fontSize: 12,
        color: "#94A3B8",
    },
});

export default styles;