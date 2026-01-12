import type React from "react"
import { View, Text, TouchableOpacity, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Bell, Globe, Palette, Info, FileText, ChevronRight, LogOut } from "lucide-react-native"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import styles from "./Setting.styles"

import type { SettingStackParamList } from "./SettingStackNavigation"
type SettingItemProps = {
    icon: React.ReactNode
    label: string
    value?: string
    isLast?: boolean
    onPress?: () => void
}

const SettingItem = ({ icon, label, value, isLast, onPress }: SettingItemProps) => (
    <TouchableOpacity
        style={[styles.settingItem, isLast && styles.settingItemLast]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <View style={styles.settingIconBox}>{icon}</View>
        <Text style={styles.settingLabel}>{label}</Text>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        <ChevronRight size={18} color="#94A3B8" />
    </TouchableOpacity>
)

export default function SettingScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<SettingStackParamList>>()

    return (
        <View style={styles.container}>
            <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* SYSTEM SECTION */}
                    <View style={[styles.section, { marginTop: 24 }]}>
                        <Text style={styles.sectionTitle}>Hệ thống</Text>
                        <SettingItem icon={<Bell size={20} color="#2563EB" />} label="Thông báo" value="Bật" />
                        <SettingItem icon={<Globe size={20} color="#2563EB" />} label="Ngôn ngữ" value="Tiếng Việt" />
                        <SettingItem icon={<Palette size={20} color="#2563EB" />} label="Giao diện" value="Sáng" isLast />
                    </View>

                    {/* APPLICATION SECTION */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Ứng dụng</Text>
                        <SettingItem
                            icon={<Info size={20} color="#2563EB" />}
                            label="Giới thiệu"
                            onPress={() => navigation.navigate('About')}
                        />
                        <SettingItem
                            icon={<FileText size={20} color="#2563EB" />}
                            label="Điều khoản sử dụng"
                            isLast
                            onPress={() => navigation.navigate('Terms')}
                        />
                    </View>

                    {/* ACCOUNT SECTION */}
                    <View style={styles.section}>
                        <SettingItem
                            icon={<LogOut size={20} color="#EF4444" />}
                            label="Đăng xuất"
                            isLast
                            onPress={() => console.log("[v0] Logging out...")}
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    )
}