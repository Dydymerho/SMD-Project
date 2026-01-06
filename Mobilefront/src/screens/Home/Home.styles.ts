import { StyleSheet, Dimensions } from "react-native"

const { width } = Dimensions.get("window")

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#0F172A",
    },
    container: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 30,
        backgroundColor: "#1E293B",
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    greeting: {
        fontSize: 28,
        fontWeight: "900",
        color: "#F8FAFC",
        letterSpacing: -0.5,
    },
    subText: {
        fontSize: 16,
        color: "#94A3B8",
        marginTop: 4,
        fontWeight: "500",
    },
    searchWrapper: {
        marginTop: 24,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#0F172A",
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: "#334155",
    },
    searchIcon: {
        fontSize: 20,
        color: "#64748B",
        marginRight: 12,
    },
    SearchBar: {
        flex: 1,
        fontSize: 16,
        color: "#F8FAFC",
        fontWeight: "500",
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 32,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "800",
        color: "#3B82F6",
        textTransform: "uppercase",
        letterSpacing: 2,
        marginBottom: 20,
    },
    courseList: {
        gap: 16,
    },
    courseItem: {
        backgroundColor: "#1E293B",
        borderRadius: 20,
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: "#334155",
    },
    courseItemHighlight: {
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.05)",
    },
    courseInfo: {
        flex: 1,
    },
    courseCode: {
        fontSize: 12,
        fontWeight: "800",
        color: "#64748B",
        marginBottom: 4,
        letterSpacing: 1,
    },
    courseCodeHighlight: {
        color: "#3B82F6",
    },
    courseName: {
        fontSize: 18,
        fontWeight: "700",
        color: "#F8FAFC",
        lineHeight: 24,
    },
    arrowIcon: {
        fontSize: 24,
        color: "#334155",
        marginLeft: 16,
    },
    arrowIconHighlight: {
        color: "#3B82F6",
    },
})

export default styles
