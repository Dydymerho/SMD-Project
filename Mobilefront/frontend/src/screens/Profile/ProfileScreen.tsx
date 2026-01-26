import React from 'react';
import { Image, View, Text, ScrollView, TouchableOpacity, StatusBar, FlatList, RefreshControl, ActivityIndicator } from "react-native"
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './styles';
import { useState, useEffect } from 'react';
import { Profile } from '../../../../backend/api/types/Profile';
import { ProfileApi } from '../../../../backend/api/ProfileApi';
const Section = ({
    title,
    children
}: {
    title?: string
    children: React.ReactNode
}) => (
    <View style={styles.section}>
        {title && <Text style={styles.sectionTitle}>{title}</Text>}
        {children}
    </View>
)

const InfoRow = ({
    label,
    value,
    iconName
}: {
    label: string
    value?: string
    iconName: string
}) => (
    <View style={styles.infoRow}>
        <View style={styles.iconBox}>
            <Icon name={iconName} size={20} color="#3b82f6" />
        </View>
        <View>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value || '—'}</Text>
        </View>
    </View>
)

const Bullet = ({ text, code }: { text: string; code: string }) => (
    <TouchableOpacity style={styles.bullet} activeOpacity={0.8}>
        <View style={styles.bulletIcon}>
            <Icon name="book-open-page-variant" size={18} color="#3b82f6" />
        </View>
        <View>
            <Text style={styles.bulletText}>{text}</Text>
        </View>
    </TouchableOpacity>
)

const BottomNavItem = ({
    label,
    iconName,
    active
}: {
    label: string
    iconName: string
    active?: boolean
}) => (
    <TouchableOpacity style={styles.navItem}>
        <Icon
            name={iconName}
            size={24}
            color={active ? '#3b82f6' : '#94a3b8'}
        />
        <Text style={[styles.navText, active && styles.navTextActive]}>
            {label}
        </Text>
    </TouchableOpacity>
)

/* =====================
        SCREEN
===================== */

export default function ProfileScreen() {
    const [showCourseList, setShowCourseList] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const COURSE_LIMIT = 4;
    // const displayShowAllCourses = showCourseList ? syllabus : syllabus.slice(0, COURSE_LIMIT)

    useEffect(() => {
        fetchProfile();
    }, []);
    const fetchProfile = async () => {
        try {
            setError(null);
            console.log("Đang gọi API...");
            const res = await ProfileApi.getMyProfile();
            setProfile(res.data);
        } catch (error: any) {
            console.error("Error fetching syllabus:", error);
            console.error("Error message:", error.message);
            console.error("Error response:", error.response?.data);
            console.error("Error status:", error.response?.status);
            console.error("Error config:", error.config?.url);

            // Phân loại error chi tiết hơn
            if (error.message === "Network Error") {
                setError("Không có kết nối mạng. Vui lòng kiểm tra internet.");
            } else if (error.response?.status === 404) {
                setError("Không tìm thấy API endpoint. Vui lòng liên hệ quản trị viên.");
            } else if (error.response?.status === 500) {
                setError("Server đang gặp sự cố. Vui lòng thử lại sau.");
            } else if (error.response?.status === 401) {
                setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
            } else {
                setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchProfile();
    };
    if (loading) {
        return <ActivityIndicator size="large" />;
    }

    if (!profile) {
        return <Text>Không có dữ liệu hồ sơ</Text>;
    }


    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* HERO */}
                <View style={styles.heroCard}>
                    <Image
                        source={{ uri: profile.avatarUrl }}
                        style={styles.avatar}
                    />
                    <Text style={styles.userName}>{profile.fullName}</Text>
                    <Text style={styles.userRole}>Sinh viên khóa 2024</Text>
                </View>

                {/* PROFILE INFO */}
                <Section title="Thông tin hồ sơ">
                    <InfoRow
                        iconName="email-outline"
                        label="Địa chỉ Email"
                        value={profile.email}
                    />
                    <InfoRow
                        iconName="earth"
                        label="Quốc gia"
                        value={profile.country}
                    />
                    <InfoRow
                        iconName="clock-outline"
                        label="Múi giờ"
                        value={profile.timezone}
                    />
                </Section>

                {/* COURSES */}
                {/* <Section title="Các khóa học">
                    {displayShowAllCourses.map((subject, index) => (
                        <Bullet
                            key={index}
                            code={subject.code}
                            text={subject.name ?? subject.title}
                        />
                    ))}
                    {syllabus.length > COURSE_LIMIT && (
                        <TouchableOpacity
                            style={styles.viewAllBtn}
                            onPress={() => setShowCourseList(prev => !prev)}
                        >
                            <Text style={styles.viewAllText}>

                                {showCourseList ? 'Thu gọn' : 'Xem tất cả'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </Section> */}
            </ScrollView>
        </View>
    );
}
