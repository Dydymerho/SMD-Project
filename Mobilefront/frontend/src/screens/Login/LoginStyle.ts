import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    inner: {
        flex: 1,
        paddingHorizontal: 28,
        justifyContent: 'center',
    },
    headerSection: {
        marginBottom: 40,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
    },
    logoSquare: {
        width: 32,
        height: 32,
        backgroundColor: '#1e293b',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoInner: {
        width: 14,
        height: 14,
        backgroundColor: '#3b82f6',
        borderRadius: 2,
    },
    logoText: {
        fontSize: 18,
        fontWeight: '900',
        color: '#1e293b',
        marginLeft: 10,
        letterSpacing: 1,
    },
    welcomeTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#0f172a',
        marginBottom: 10,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
        lineHeight: 24,
    },
    formSection: {
        width: '100%',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        borderRadius: 16,
        paddingHorizontal: 16,
        marginBottom: 18,
        height: 58,
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        // Elevation for Android
        elevation: 2,
    },
    inputFocused: {
        borderColor: '#3b82f6',
        backgroundColor: '#fff',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1e293b',
        fontWeight: '500',
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 28,
    },
    forgotPasswordText: {
        color: '#3b82f6',
        fontWeight: '600',
        fontSize: 14,
    },
    loginButton: {
        backgroundColor: '#2563eb',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 18,
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 8,
    },
    loginButtonDisabled: {
        backgroundColor: '#93c5fd',
        opacity: 0.8,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        marginRight: 10,
    },
    disabledText: {
        opacity: 0.5,
    },
})
export default styles