"use client"

import React from "react"
import LinearGradient from 'react-native-linear-gradient'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
} from "react-native"
import { Mail, Lock, ArrowRight, Github, Chrome } from "lucide-react-native"

const { width } = Dimensions.get("window")

type LoginScreenProps = {
    setIsLoggedIn: (value: boolean) => void
}

export default function LoginScreen({ setIsLoggedIn }: LoginScreenProps) {
    const [email, setEmail] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [isFocused, setIsFocused] = React.useState<string | null>(null)

    const handleLogin = () => {
        if (email.trim() && password.trim()) {
            setIsLoggedIn(true)
        } else {
            Alert.alert("Thông báo", "Vui lòng nhập đầy đủ Email và Mật khẩu để tiếp tục.")
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={["#2563eb", "#38bdf8", "#f472b6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.inner}>
                <View style={styles.headerSection}>
                    <View style={styles.logoContainer}>
                        <View style={styles.logoSquare}>
                            <View style={styles.logoInner} />
                        </View>
                        <Text style={styles.logoText}>SMD</Text>
                    </View>
                    <Text style={styles.welcomeTitle}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Đăng nhập vào SMD.</Text>
                </View>

                <View style={styles.formSection}>
                    <View style={[styles.inputWrapper, isFocused === "email" && styles.inputFocused]}>
                        <Mail size={20} color={isFocused === "email" ? "#2563eb" : "#94a3b8"} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Địa chỉ Email"
                            placeholderTextColor="#94a3b8"
                            value={email}
                            onChangeText={setEmail}
                            onFocus={() => setIsFocused("email")}
                            onBlur={() => setIsFocused(null)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={[styles.inputWrapper, isFocused === "password" && styles.inputFocused]}>
                        <Lock size={20} color={isFocused === "password" ? "#2563eb" : "#94a3b8"} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Mật khẩu"
                            placeholderTextColor="#94a3b8"
                            value={password}
                            onChangeText={setPassword}
                            onFocus={() => setIsFocused("password")}
                            onBlur={() => setIsFocused(null)}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity style={styles.forgotPassword}>
                        <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.8}>
                        <Text style={styles.loginButtonText}>Đăng nhập</Text>
                        <ArrowRight size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "transparent",
    },
    inner: {
        flex: 1,
        paddingHorizontal: 28,
        justifyContent: "center",
    },
    headerSection: {
        marginBottom: 40,
    },
    logoContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 32,
    },
    logoSquare: {
        width: 32,
        height: 32,
        backgroundColor: "#1e293b",
        borderRadius: 6,
        justifyContent: "center",
        alignItems: "center",
    },
    logoInner: {
        width: 14,
        height: 14,
        backgroundColor: "#3b82f6",
        borderRadius: 2,
    },
    logoText: {
        fontSize: 18,
        fontWeight: "900",
        color: "#1e293b",
        marginLeft: 10,
        letterSpacing: 1,
    },
    welcomeTitle: {
        fontSize: 32,
        fontWeight: "800",
        color: "#0f172a",
        marginBottom: 10,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: "#64748b",
        lineHeight: 24,
    },
    formSection: {
        width: "100%",
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderWidth: 1.5,
        borderColor: "#e2e8f0",
        borderRadius: 16,
        paddingHorizontal: 16,
        marginBottom: 18,
        height: 58,
        // Shadow for iOS
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        // Elevation for Android
        elevation: 2,
    },
    inputFocused: {
        borderColor: "#3b82f6",
        backgroundColor: "#fff",
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: "#1e293b",
        fontWeight: "500",
    },
    forgotPassword: {
        alignSelf: "flex-end",
        marginBottom: 28,
    },
    forgotPasswordText: {
        color: "#3b82f6",
        fontWeight: "600",
        fontSize: 14,
    },
    loginButton: {
        backgroundColor: "#2563eb",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 18,
        borderRadius: 18,
        shadowColor: "#2563eb",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 8,
    },
    loginButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
        marginRight: 10,
    },
    dividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 32,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: "#e2e8f0",
    },
    dividerText: {
        marginHorizontal: 15,
        color: "#94a3b8",
        fontSize: 13,
        fontWeight: "500",
    },
    socialContainer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 20,
    },
    socialButton: {
        width: 60,
        height: 60,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: "#e2e8f0",
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
    },
    footerSection: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 40,
    },
    footerText: {
        color: "#64748b",
        fontSize: 15,
    },
    signUpText: {
        color: "#2563eb",
        fontSize: 15,
        fontWeight: "700",
    },
})
