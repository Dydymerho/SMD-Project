import { StyleSheet, Dimensions, Platform } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },

    /* ===== HEADER GRADIENT (Đã điều chỉnh chiều cao) ===== */
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

    /* ===== AVATAR & INFO CARD (Đã căn chỉnh lại vị trí) ===== */
    profileCard: {
        alignItems: 'center',
        marginTop: 10,
        paddingBottom: 10,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    avatarImage: {
        width: 100, // Giảm size avatar chút xíu cho cân đối (cũ 110)
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#FFFFFF',
        backgroundColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 36,
        fontWeight: '800',
        color: '#3b82f6',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        padding: 8,
        borderRadius: 20,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },

    nameText: {
        fontSize: 22, // Cân đối lại size tên
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 4,
    },
    roleText: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '600',
        backgroundColor: '#E2E8F0',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: 'hidden',
    },

    /* ... (Các phần STATS, INFO SECTION, BUTTON giữ nguyên như cũ) ... */
    // Bạn giữ nguyên code phần dưới của file styles cũ
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 20,
        paddingVertical: 20,
        shadowColor: "#64748B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1E293B',
    },
    statLabel: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 4,
        fontWeight: '600',
    },
    statDivider: {
        width: 1,
        height: '70%',
        backgroundColor: '#F1F5F9',
        alignSelf: 'center',
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 100,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#334155',
        marginBottom: 16,
        marginTop: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    infoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: "#64748B",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
    },
    infoIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#94A3B8',
        marginBottom: 2,
        fontWeight: '600',
    },
    infoValue: {
        fontSize: 15,
        color: '#1E293B',
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
});

export default styles;