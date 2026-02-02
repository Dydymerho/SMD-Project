import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    /* HEADER SECTION (Gradient Background Area) */
    headerContainer: {
        height: height * 0.35, // Chiếm 35% màn hình
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 40,
    },
    logoContainer: {
        width: 90,
        height: 90,
        backgroundColor: 'rgba(255, 255, 255, 0.2)', // Glass effect
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    logoText: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 2,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    subText: {
        fontSize: 14,
        color: '#E2E8F0', // Slate-200
        fontWeight: '500',
    },

    /* FORM SECTION (White Bottom Sheet) */
    formContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 24,
        paddingTop: 40,
        marginTop: -30, // Đẩy lên đè vào header
        // Shadow cho khối trắng
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B', // Slate-500
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC', // Slate-50
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: '#E2E8F0', // Slate-200
        marginBottom: 20,
    },
    inputFocused: {
        borderColor: '#3b82f6', // Blue-500
        backgroundColor: '#EFF6FF', // Blue-50
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1E293B',
        height: '100%',
    },

    /* BUTTONS */
    loginButton: {
        borderRadius: 16,
        height: 56,
        overflow: 'hidden',
        marginTop: 8,
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    gradientBtn: {
        width: '100%',
        height: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.5,
        marginRight: 8,
    },

});

export default styles;