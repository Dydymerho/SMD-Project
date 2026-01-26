// screens/Setting/SettingScreen.tsx
import type React from "react"
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Bell, Globe, Palette, Info, FileText, ChevronRight, LogOut } from "lucide-react-native"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import styles from "./Setting.styles"
import { useAuth } from "../../../../backend/Contexts/AuthContext"
import type { SettingStackParamList } from "./SettingStackNavigation"

type SettingItemProps = {
    icon: React.ReactNode
    label: string
    value?: string
    isLast?: boolean
    onPress?: () => void
    isDestructive?: boolean
}

const SettingItem = ({
    icon,
    label,
    value,
    isLast,
    onPress,
    isDestructive = false
}: SettingItemProps) => (
    <TouchableOpacity
        style={[styles.settingItem, isLast && styles.settingItemLast]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <View style={[
            styles.settingIconBox,
            isDestructive && styles.destructiveIconBox
        ]}>
            {icon}
        </View>
        <Text style={[
            styles.settingLabel,
            isDestructive && styles.destructiveLabel
        ]}>
            {label}
        </Text>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        <ChevronRight size={18} color={isDestructive ? "#EF4444" : "#94A3B8"} />
    </TouchableOpacity>
)

export default function SettingScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<SettingStackParamList>>()
    const { logout } = useAuth()

    const handleLogout = async () => {
        Alert.alert(
            "Đăng xuất",
            "Bạn có chắc chắn muốn đăng xuất?",
            [
                {
                    text: "Hủy",
                    style: "cancel"
                },
                {
                    text: "Đăng xuất",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await logout()
                            // Navigate về login screen
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Login' as never }],
                            })
                        } catch (error) {
                            Alert.alert("Lỗi", "Không thể đăng xuất. Vui lòng thử lại.")
                        }
                    }
                }
            ]
        )
    }

    return (
        <View style={styles.container}>
            <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* PROFILE SECTION (Optional) */}
                    <View style={styles.profileSection}>
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>T</Text>
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>Tiến Nguyễn</Text>
                            <Text style={styles.profileEmail}>student@university.edu</Text>
                        </View>
                    </View>

                    {/* SYSTEM SECTION */}
                    <View style={[styles.section, { marginTop: 24 }]}>
                        <Text style={styles.sectionTitle}>Hệ thống</Text>
                        <SettingItem
                            icon={<Bell size={20} color="#2563EB" />}
                            label="Thông báo"
                            value="Bật"
                        />
                    </View>

                    {/* SUPPORT SECTION */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Hỗ trợ</Text>
                        <SettingItem
                            icon={<Info size={20} color="#2563EB" />}
                            label="Giới thiệu"
                            onPress={() => navigation.navigate('About')}
                        />
                        <SettingItem
                            icon={<FileText size={20} color="#2563EB" />}
                            label="Điều khoản sử dụng"
                            onPress={() => navigation.navigate('Terms')}
                        />
                    </View>

                    {/* ACCOUNT SECTION */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Tài khoản</Text>
                        <SettingItem
                            icon={<LogOut size={20} color="#EF4444" />}
                            label="Đăng xuất"
                            isLast
                            isDestructive
                            onPress={handleLogout}
                        />
                    </View>

                    {/* APP INFO */}
                    <View style={styles.appInfo}>
                        <Text style={styles.appVersion}>Phiên bản 1.0.0</Text>
                        <Text style={styles.appCopyright}>© 2024 University App</Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    )
}