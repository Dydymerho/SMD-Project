import { StyleSheet, Dimensions } from "react-native"

const { width } = Dimensions.get("window")

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#ffffff",
    },
    container: {
        flexGrow: 1,
        paddingBottom: 100,
        paddingLeft: 8,
        paddingRight: 8,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 30,
        backgroundColor: "#ffffff",
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
        color: "#0F172A",
        letterSpacing: -0.5,
    },
    subText: {
        fontSize: 16,
        color: "#64748B",
        marginTop: 4,
        fontWeight: "500",
    },
    searchWrapper: {
        marginTop: 24,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: "#b9bcc2ff",
    },
    searchIcon: {
        fontSize: 20,
        color: "#64748b69",
        marginRight: 12,
    },
    SearchBar: {
        flex: 1,
        fontSize: 16,
        color: "#0F172A",
        fontWeight: "500",
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 30,
        paddingHorizontal: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#3B82F6",
        textTransform: "uppercase",
        letterSpacing: 2,
        marginBottom: 20,
    },
    courseHeader: {
        backgroundColor: "#4000FF",
    },
    courseList: {
        gap: 16,
    },
    courseItem: {
        backgroundColor: "#ffffff",
        borderRadius: 20,
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: "#b9bcc2ff",
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
        color: "#0F172A",
        lineHeight: 24,
    },
    descriptionContainer: {
        borderBlockColor: "#e2e8f0",
        marginTop: 8,
        maxWidth: width - 140,
    },
    arrowIcon: {
        fontSize: 24,
        color: "#334155",
        marginLeft: 16,
    },
    arrowIconHighlight: {
        color: "#3B82F6",
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        overflow: "hidden",
        marginVertical: 12,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
    },
    /* HEADER */
    headerCard: {
        backgroundColor: "#4F1CFF",
        padding: 16,
    },
    code: {
        color: "#DAD7FF",
        fontSize: 16,
        fontWeight: "600",
    },
    title: {
        color: "#FFFFFF",
        fontSize: 20,
        fontWeight: "800",
        marginTop: 4,
    },

    /* BODY */
    body: {
        padding: 16,
    },
    text: {
        fontSize: 16,
        color: "#334155",
        marginBottom: 6,
    },

    /* DESCRIPTION */
    descBox: {
        backgroundColor: "#E8F1FF",
        borderRadius: 10,
        padding: 12,
        marginTop: 12,
    },
    descTitle: {
        color: "#2563EB",
        fontWeight: "700",
        marginBottom: 4,
        fontSize: 13,
    },
    descText: {
        color: "#1E293B",
        fontSize: 15,
        lineHeight: 18,
    },

    /* BUTTON */
    button: {
        backgroundColor: "#4F1CFF",
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
        marginTop: 16,
    },
    buttonText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 15,
    },
    buttonFilter: {
        backgroundColor: "#f3f3f37e",
        borderWidth: 1,         // Độ dày viền
        borderColor: "#e6e3e3ff", // Màu viền (có thể thay đổi)
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
        alignContent: "center",
        alignSelf: "flex-end",
        marginBottom: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    filter_container: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        alignItems: "center"
    },
    filter_tag: {
        width: "80%",
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
        alignItems: "center"
    },
    filter_choices: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 16
    },
    filter_elements: {
        marginTop: 20,
        backgroundColor: "#3B82F6",
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8
    },
    title_button: {
        color: "#fff",
        fontWeight: "bold"
    }

})

export default styles
