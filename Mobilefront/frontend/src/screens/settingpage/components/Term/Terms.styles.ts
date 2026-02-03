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
    /* ===== HEADER ===== */
    headerContainer: {
        marginBottom: 24,
        marginTop: 10,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: "800",
        color: "#1E293B", // Slate-800
        marginBottom: 8,
    },
    lastUpdated: {
        fontSize: 13,
        color: "#64748B", // Slate-500
        fontStyle: "italic",
    },
    introText: {
        fontSize: 15,
        color: "#334155",
        lineHeight: 22,
        marginBottom: 10,
    },
    /* ===== TERM CARD ===== */
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        // Shadow
        shadowColor: "#64748B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: "transparent",
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
        paddingBottom: 12,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1E293B",
        flex: 1,
    },
    cardText: {
        fontSize: 14,
        lineHeight: 22,
        color: "#475569", // Slate-600
        textAlign: "justify",
    },

    /* ===== FOOTER ===== */
    footer: {
        marginTop: 20,
        padding: 16,
        backgroundColor: "#EFF6FF", // Blue-50
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#DBEAFE",
    },
    footerText: {
        fontSize: 13,
        color: "#2563EB",
        textAlign: "center",
        fontWeight: "500",
    },
});

export default styles;