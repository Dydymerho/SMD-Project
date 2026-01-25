import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNavigation, type NavigationProp } from "@react-navigation/native"
import { ChevronLeft, Bell } from "lucide-react-native"

type HeaderProps = {
    title: string
    showRightIcon?: boolean
    onRightPress?: () => void
}

export default function Header({ title, showRightIcon = false, onRightPress }: HeaderProps) {
    const insets = useSafeAreaInsets()
    const navigation = useNavigation<NavigationProp<any>>()
    const canGoBack = navigation.canGoBack()

    return (
        <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
            {/* LEFT */}
            <View style={styles.side}>
                {canGoBack ? (
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        activeOpacity={0.7}
                    >
                        <ChevronLeft color="#FFFFFF" size={28} strokeWidth={2.5} />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 28 }} />
                )}
            </View>

            {/* CENTER */}
            <View style={styles.center}>
                <Text style={styles.title} numberOfLines={1}>
                    {title}
                </Text>
            </View>

            {/* RIGHT */}
            <View style={styles.side}>
                {showRightIcon ? (
                    <TouchableOpacity
                        onPress={onRightPress}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        activeOpacity={0.7}
                    >
                        <Bell color="#FFFFFF" size={24} strokeWidth={2} />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 28 }} />
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#2D5BFF",
        paddingHorizontal: 20,
        paddingBottom: 20,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    side: {
        width: 44,
        alignItems: "center",
        justifyContent: "center",
    },
    center: {
        flex: 1,
        alignItems: "center",
    },
    title: {
        fontSize: 18,
        fontWeight: "800",
        color: "#FFFFFF",
        letterSpacing: 1.2,
        textTransform: "uppercase",
    },
})
