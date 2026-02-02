import React from 'react';
import { Image, View, Text, ScrollView, TouchableOpacity, StatusBar, FlatList, RefreshControl, ActivityIndicator } from "react-native"
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './styles';
import { useState, useEffect } from 'react';
import { Profile } from '../../../../backend/types/Profile';
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



/* =====================
        SCREEN
===================== */

export default function ProfileScreen() {
    const [error, setError] = useState<string | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    // const displayShowAllCourses = showCourseList ? syllabus : syllabus.slice(0, COURSE_LIMIT)

    useEffect(() => {
        fetchProfile();
    }, []);
    const fetchProfile = async () => {
        try {
            setError(null);
            // ...
            const res: any = await ProfileApi.getMyProfile();

            // --- SỬA ĐOẠN NÀY ---
            // Gộp dữ liệu từ res (chứa country, timezone) và res.user (chứa email, fullName...)
            const mappedProfile: Profile = {
                ...res.user,        // Lấy userId, fullName, email, username từ trong object 'user'
                country: res.country,   // Lấy country từ bên ngoài
                timezone: res.timezone, // Lấy timezone từ bên ngoài
                // Map thêm các trường nếu tên không khớp, ví dụ:
                // studentId: res.user.userId (nếu cần mapping id sang studentId)
            };

            setProfile(mappedProfile);

        } catch (error: any) {
            // ... xử lý lỗi
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

    const getAvatarLetter = () => {
        if (profile?.fullName) {
            return profile.fullName.charAt(0).toUpperCase();
        }
        return "U";
    };

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.heroCard}>
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{getAvatarLetter()}</Text>
                    </View>

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
                </Section>  */}
            </ScrollView>
        </View>
    );
}
