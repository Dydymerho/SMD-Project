import React, { useEffect, useState, useCallback } from "react";
import {
    View, Text, ScrollView, TouchableOpacity,
    ActivityIndicator, RefreshControl, StatusBar
} from "react-native";
import { Bell, CheckCircle, Info, AlertCircle, Clock, Calendar } from "lucide-react-native";
import LinearGradient from "react-native-linear-gradient"; // Cần thư viện này
import { NotificationApi } from "../../../../backend/api/NotificationApi";
import { Notification } from "../../../../backend/types/Notification";
import styles from "./Notification.styles";

/* --- HELPER FUNCTIONS --- */
const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Vừa xong";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 172800) return "Hôm qua";
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
};

// Hàm trả về Icon và Màu nền tương ứng (Modern Badge Style)
const getNotificationStyle = (type: string) => {
    switch (type) {
        case "SYSTEM": // Lỗi / Hệ thống
            return { icon: <AlertCircle size={22} color="#EF4444" />, bg: "#FEE2E2" };
        case "UPDATE": // Cập nhật
            return { icon: <Info size={22} color="#3B82F6" />, bg: "#DBEAFE" };
        case "SUCCESS": // Thành công
            return { icon: <CheckCircle size={22} color="#10B981" />, bg: "#D1FAE5" };
        default: // Thông thường
            return { icon: <Bell size={22} color="#F59E0B" />, bg: "#FEF3C7" };
    }
};

export default function NotificationScreen() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = async () => {
        try {
            const res = await NotificationApi.getAll(0, 50);
            setNotifications(res.content);
        } catch (error) {
            console.error("Lỗi lấy thông báo:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchNotifications();
    }, []);

    // Phân nhóm thông báo
    const today = new Date().setHours(0, 0, 0, 0);
    const todayNotifications = notifications.filter(n => new Date(n.createdAt).getTime() >= today);
    const oldNotifications = notifications.filter(n => new Date(n.createdAt).getTime() < today);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    // --- RENDER ITEM ---
    const renderItem = (item: Notification) => {
        const styleConfig = getNotificationStyle(item.type);

        return (
            <TouchableOpacity
                key={item.notificationId}
                activeOpacity={0.7}
                style={[styles.card, item.isRead ? styles.cardRead : styles.cardUnread]}
                onPress={async () => {
                    if (!item.isRead) {
                        // Optimistic update: Cập nhật UI ngay lập tức
                        setNotifications(prev => prev.map(n =>
                            n.notificationId === item.notificationId ? { ...n, isRead: true } : n
                        ));
                        // Gọi API sau
                        await NotificationApi.markAsRead(item.notificationId);
                    }
                }}
            >
                {/* 1. Icon Badge (Trái) */}
                <View style={[styles.iconContainer, { backgroundColor: styleConfig.bg }]}>
                    {styleConfig.icon}
                </View>

                {/* 2. Nội dung (Phải) */}
                <View style={styles.contentContainer}>
                    <View style={styles.topRow}>
                        <Text
                            style={[styles.titleText, item.isRead ? styles.titleNormal : styles.titleBold]}
                            numberOfLines={2}
                        >
                            {item.title}
                        </Text>
                        {!item.isRead && <View style={styles.blueDot} />}
                    </View>

                    <Text style={styles.messageText} numberOfLines={2}>
                        {item.message}
                    </Text>

                    <View style={styles.footerRow}>
                        <Clock size={12} color="#94A3B8" />
                        <Text style={styles.timeText}>
                            {formatTimeAgo(item.createdAt)}
                        </Text>

                        {item.courseCode && (
                            <View style={styles.courseTag}>
                                <Text style={styles.courseTagText}>{item.courseCode}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#15803D" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* HEADER GRADIENT (Giống Home/Profile) */}
            <LinearGradient colors={["#32502a", "#20331b"]} style={styles.headerGradient}>
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.headerTitle}>Thông báo</Text>
                    </View>
                    {unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadText}>{unreadCount}</Text>
                        </View>
                    )}
                </View>
            </LinearGradient>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#15803D" colors={["#15803D"]} />
                }
            >
                {notifications.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Bell size={64} color="#CBD5E1" />
                        <Text style={styles.emptyText}>Bạn chưa có thông báo nào</Text>
                    </View>
                ) : (
                    <>
                        {/* NHÓM HÔM NAY */}
                        {todayNotifications.length > 0 && (
                            <View>
                                <View style={styles.sectionHeader}>
                                    <Calendar size={16} color="#64748B" />
                                    <Text style={styles.sectionTitle}>Hôm nay</Text>
                                    <View style={styles.sectionLine} />
                                </View>
                                {todayNotifications.map(renderItem)}
                            </View>
                        )}

                        {/* NHÓM CŨ HƠN */}
                        {oldNotifications.length > 0 && (
                            <View style={{ marginTop: 10 }}>
                                <View style={styles.sectionHeader}>
                                    <Clock size={16} color="#64748B" />
                                    <Text style={styles.sectionTitle}>Trước đó</Text>
                                    <View style={styles.sectionLine} />
                                </View>
                                {oldNotifications.map(renderItem)}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
}