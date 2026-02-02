import { StyleSheet, Platform } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC', // Slate-50 background
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
    headerTitle: {
        fontSize: 20, // Tăng size chữ (cũ là 18)
        fontWeight: '800', // Đậm hơn
        color: '#FFFFFF',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 30,
    },

    /* ===== SCROLL CONTENT ===== */
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        paddingTop: 10,
    },

    /* ===== PROFILE MINI CARD ===== */
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 24,
        // Shadow
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    avatarContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#EFF6FF', // Blue-50
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '800',
        color: '#3B82F6',
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 13,
        color: '#64748B',
    },

    /* ===== SETTING SECTION (CARD) ===== */
    section: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 20,
        paddingVertical: 4,
        paddingHorizontal: 16,
        // Shadow
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#64748B',
        marginBottom: 8,
        marginTop: 4,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    /* ===== SETTING ITEM ROW ===== */
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    settingItemLast: {
        borderBottomWidth: 0,
    },

    // Icon Box bên trái
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    destructiveIcon: {
        backgroundColor: '#FEE2E2', // Red-100
    },

    itemLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#334155', // Slate-700
    },
    destructiveLabel: {
        color: '#EF4444',
    },

    itemValue: {
        fontSize: 14,
        color: '#94A3B8',
        marginRight: 8,
    },

    /* ===== FOOTER INFO ===== */
    appInfo: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 30,
    },
    appVersion: {
        fontSize: 13,
        fontWeight: '600',
        color: '#94A3B8',
    },
    appCopyright: {
        fontSize: 11,
        color: '#CBD5E1',
        marginTop: 4,
    },
});

export default styles;