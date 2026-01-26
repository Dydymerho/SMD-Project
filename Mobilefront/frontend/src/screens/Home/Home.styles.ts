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
        backgroundColor: "#008f81",
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
        color: "#000000",
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
        color: "#000000",
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
    },
    // Loading
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#64748B',
    },

    // Error
    errorContainer: {
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#FFF5F5',
        margin: 16,
        borderRadius: 12,
    },
    errorText: {
        color: '#FF3B30',
        textAlign: 'center',
        marginVertical: 12,
        fontSize: 14,
    },
    retryButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },

    // Empty state
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
        marginTop: 12,
    },
    clearSearchButton: {
        marginTop: 16,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    clearSearchText: {
        color: '#007AFF',
        fontSize: 14,
    },

    // Filter
    filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: '#007AFF',
        borderRadius: 20,
    },
    filterButtonText: {
        color: '#007AFF',
        marginLeft: 4,
        fontSize: 14,
        fontWeight: '500',
    },
    clearFilterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    clearFilterText: {
        color: '#FF3B30',
        marginRight: 4,
        fontSize: 14,
    },
    activeFilters: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 12,
        gap: 8,
    },
    filterChip: {
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    filterChipText: {
        color: '#007AFF',
        fontSize: 12,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    filterModal: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    filterHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    filterTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    filterContent: {
        padding: 16,
    },
    filterSection: {
        marginBottom: 24,
    },
    filterSectionTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
        color: '#1C1C1E',
    },
    filterDropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: '#C7C7CC',
        borderRadius: 8,
    },
    filterDropdownText: {
        fontSize: 16,
        color: '#1C1C1E',
    },
    filterList: {
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#F2F2F7',
        borderRadius: 8,
        maxHeight: 200,
    },
    filterOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    filterOptionSelected: {
        backgroundColor: '#F0F9FF',
    },
    filterOptionText: {
        fontSize: 16,
        color: '#1C1C1E',
    },
    filterOptionTextSelected: {
        color: '#007AFF',
        fontWeight: '500',
    },
    filterFooter: {
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#F2F2F7',
        gap: 12,
    },
    filterCancelButton: {
        flex: 1,
        padding: 16,
        borderWidth: 1,
        borderColor: '#C7C7CC',
        borderRadius: 12,
        alignItems: 'center',
    },
    filterCancelText: {
        color: '#FF3B30',
        fontSize: 16,
        fontWeight: '600',
    },
    filterApplyButton: {
        flex: 1,
        padding: 16,
        backgroundColor: '#007AFF',
        borderRadius: 12,
        alignItems: 'center',
    },
    filterApplyText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },

    // Course Card
    courseCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        backgroundColor: '#30c4b0',
        padding: 16,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    codeBadge: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginRight: 12,
    },
    codeText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 12,
    },
    courseTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    cardBody: {
        padding: 16,
    },
    courseInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    courseInfoText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#64748B',
    },
    descriptionBox: {
        marginTop: 12,
        padding: 12,
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
    },
    descriptionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1C1C1E',
        marginBottom: 4,
    },
    descriptionText: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 20,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F2F2F7',
    },
    viewDetailText: {
        color: '#007AFF',
        fontSize: 14,
        fontWeight: '600',
    },
})

export default styles
