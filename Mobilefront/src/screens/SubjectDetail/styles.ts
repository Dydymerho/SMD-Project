
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        padding: 16,
    },

    /* HEADER */
    header: {
        backgroundColor: '#2563EB',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },

    title: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '800',
    },
    treeTitle: {
        fontWeight: '700',
        fontSize: 15,
        color: '#2563EB',
        marginBottom: 8,
    },
    subtitle: {
        color: '#E0E7FF',
        marginTop: 4,
        fontSize: 14,
    },

    headerActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
    },

    tag: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },

    tagText: {
        color: '#2563EB',
        fontWeight: '600',
        fontSize: 12,
    },

    /* SECTION */
    section: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        marginBottom: 14,
    },

    sectionTitle: {
        fontWeight: '700',
        marginBottom: 8,
        fontSize: 14,
    },

    paragraph: {
        color: '#374151',
        lineHeight: 20,
    },

    /* INFO */
    infoRow: {
        flexDirection: 'row',
        marginBottom: 6,
    },

    infoLabel: {
        fontWeight: '600',
        width: 180,
    },

    infoValue: {
        color: '#374151',
    },

    /* CLO */
    bullet: {
        marginBottom: 6,
        color: '#374151',
    },

    mapping: {
        fontWeight: '600',
        color: '#1D4ED8',
    },

    /* LINK */
    linkBtn: {
        paddingVertical: 8,
    },

    linkText: {
        color: '#2563EB',
        fontWeight: '600',
    },

    /* REPORT */
    reportBtn: {
        backgroundColor: '#FEE2E2',
        padding: 14,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 10,
    },

    reportText: {
        color: '#B91C1C',
        fontWeight: '700',
    },

    /* TEACHING PLAN */
    teachingPlanRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    week: {
        width: 40,
        fontWeight: '600',
        color: '#2563EB',
    },
    topic: {
        flex: 1,
        color: '#374151',
        marginLeft: 8,
    },
    method: {
        width: 100,
        color: '#6B7280',
        textAlign: 'right',
    },
});

export default styles;
