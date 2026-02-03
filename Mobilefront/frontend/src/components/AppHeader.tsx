import React from "react"
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNavigation, type NavigationProp } from "@react-navigation/native"
import { ChevronLeft, Bell } from "lucide-react-native"
import LinearGradient from "react-native-linear-gradient"

type HeaderProps = {
    title: string
    showRightIcon?: boolean
    onRightPress?: () => void
    transparent?: boolean
}

export default function AppHeader({ title, showRightIcon = false, onRightPress, transparent = false }: HeaderProps) {
    const insets = useSafeAreaInsets()
    const navigation = useNavigation<NavigationProp<any>>()
    const canGoBack = navigation.canGoBack()

    // Tính toán chiều cao header dựa trên tai thỏ
    const headerHeight = insets.top + 60

    return (
        <View style={[styles.wrapper, { height: headerHeight }]}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <LinearGradient
                colors={transparent ? ["rgba(0,0,0,0.6)", "transparent"] : ["#32502a", "#20331b"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                    styles.container,
                    { paddingTop: insets.top },
                    !transparent && styles.shadowEffect
                ]}
            >
                {/* LEFT BUTTON */}
                <View style={styles.sideContainer}>
                    {canGoBack ? (
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                            activeOpacity={0.7}
                            style={styles.iconButton}
                        >
                            <ChevronLeft color="#FFFFFF" size={26} strokeWidth={2.5} />
                        </TouchableOpacity>
                    ) : (
                        <View style={{ width: 40 }} />
                    )}
                </View>

                {/* CENTER TITLE */}
                <View style={styles.centerContainer}>
                    <Text style={styles.title} numberOfLines={1}>
                        {title}
                    </Text>
                </View>

                {/* RIGHT BUTTON */}
                <View style={styles.sideContainer}>
                    {showRightIcon ? (
                        <TouchableOpacity
                            onPress={onRightPress}
                            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                            activeOpacity={0.7}
                            style={styles.iconButton}
                        >
                            <Bell color="#FFFFFF" size={22} strokeWidth={2.5} />
                        </TouchableOpacity>
                    ) : (
                        <View style={{ width: 40 }} />
                    )}
                </View>
            </LinearGradient>
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        zIndex: 100,
        backgroundColor: 'transparent',
    },
    container: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    shadowEffect: {
        shadowColor: "#20331b",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 10,
    },
    sideContainer: {
        width: 48,
        alignItems: "flex-start",
        justifyContent: "center",
    },
    centerContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 18,
        fontWeight: "800",
        color: "#FFFFFF",
        letterSpacing: 0.5,
        textTransform: "uppercase",
        textAlign: "center",
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.15)", // Glass effect
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    }
})