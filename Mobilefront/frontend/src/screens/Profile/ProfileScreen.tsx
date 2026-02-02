import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    ActivityIndicator, StatusBar, RefreshControl
} from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

import styles from './styles';
import { Profile } from '../../../../backend/types/Profile';
import { ProfileApi } from '../../../../backend/api/ProfileApi';

// Component hiển thị thông tin từng dòng
const InfoRow = ({ label, value, iconName, lastItem }: { label: string, value?: string, iconName: string, lastItem?: boolean }) => (
    <View style={[styles.infoRow, lastItem && { borderBottomWidth: 0 }]}>
        <View style={styles.infoIconBox}>
            <Icon name={iconName} size={22} color="#3b82f6" />
        </View>
        <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{value || '—'}</Text>
        </View>
    </View>
);

export default function ProfileScreen() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchProfile = async () => {
        try {
            const res: any = await ProfileApi.getMyProfile();
            const mappedProfile: Profile = {
                ...(res.user || {}),
                country: res.country || "Việt Nam",
                timezone: res.timezone || "GMT+7",
            };
            setProfile(mappedProfile);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchProfile();
    };

    const getAvatarLetter = () => {
        return profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : "U";
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    if (!profile) return <View style={styles.loadingContainer}><Text>Không có dữ liệu</Text></View>;

    return (
        <View style={styles.container}>
            {/* Thanh trạng thái trong suốt đè lên Gradient */}
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFF" />}
                bounces={false} // Tắt hiệu ứng nảy trên iOS để Header không bị tách rời
            >
                {/* 1. HEADER GRADIENT - Đã giảm chiều cao */}
                <LinearGradient
                    colors={["#32502a", "#20331b"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerGradient}
                >
                    <Text style={styles.headerTitle}>HỒ SƠ CÁ NHÂN</Text>
                </LinearGradient>

                {/* 2. AVATAR & NAME CARD (Nổi lên trên Header) */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatarImage}>
                            <Text style={styles.avatarText}>{getAvatarLetter()}</Text>
                        </View>
                        <TouchableOpacity style={styles.editBadge}>
                            <Icon name="camera-plus" size={16} color="#3b82f6" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.nameText}>{profile.fullName}</Text>
                    <Text style={styles.roleText}>Sinh viên • K2024</Text>
                </View>

                {/* 3. STATS ROW */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>15</Text>
                        <Text style={styles.statLabel}>Môn học</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>3.6</Text>
                        <Text style={styles.statLabel}>GPA</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>85</Text>
                        <Text style={styles.statLabel}>Tín chỉ</Text>
                    </View>
                </View>

                {/* 4. INFO CONTENT */}
                <View style={styles.contentContainer}>
                    <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>

                    <View style={styles.infoCard}>
                        <InfoRow
                            iconName="email-outline"
                            label="Email đăng nhập"
                            value={profile.email}
                        />
                        <InfoRow
                            iconName="account-circle-outline"
                            label="Tên đăng nhập"
                            value={profile.username}
                        />
                        <InfoRow
                            iconName="earth"
                            label="Quốc gia"
                            value={profile.country}
                        />
                        <InfoRow
                            iconName="clock-time-four-outline"
                            label="Múi giờ"
                            value={profile.timezone}
                            lastItem
                        />
                    </View>

                    <Text style={{ textAlign: 'center', marginTop: 20, color: '#94A3B8', fontSize: 12 }}>
                        Phiên bản ứng dụng 1.0.2
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}