import React, { useEffect, useState, useCallback } from "react";
import {
    View, Text, ScrollView, TouchableOpacity,
    ActivityIndicator, RefreshControl
} from "react-native";
import { Bell, CheckCircle, Info, AlertCircle, Clock } from "lucide-react-native";
import { NotificationApi } from "../../../../backend/api/NotificationApi";
import { Notification } from "../../../../backend/types/Notification";
import styles from "./Notification.styles"; // Import file style

const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Vừa xong";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 172800) return "Hôm qua";
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

const getIcon = (type: string) => {
    switch (type) {
        case "SYSTEM": return <AlertCircle size={24} color="#DC2626" />;
        case "UPDATE": return <Info size={24} color="#2563EB" />;
        case "SUCCESS": return <CheckCircle size={24} color="#16A34A" />;
        default: return <Bell size={24} color="#F59E0B" />;
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

    const today = new Date().setHours(0, 0, 0, 0);
    const todayNotifications = notifications.filter(n => new Date(n.createdAt).getTime() >= today);
    const oldNotifications = notifications.filter(n => new Date(n.createdAt).getTime() < today);

    const renderItem = (item: Notification) => (
        <TouchableOpacity
            key={item.notificationId}
            activeOpacity={0.7}
            // Kết hợp style chung và style trạng thái (đã đọc/chưa đọc)
            style={[styles.card, item.isRead ? styles.cardRead : styles.cardUnread]}
            onPress={async () => {
                if (!item.isRead) {
                    await NotificationApi.markAsRead(item.notificationId);
                    setNotifications(prev => prev.map(n =>
                        n.notificationId === item.notificationId ? { ...n, isRead: true } : n
                    ));
                }
            }}
        >
            {/* ICON */}
            <View style={styles.cardIconContainer}>
                {getIcon(item.type)}
            </View>

            {/* CONTENT */}
            <View style={styles.cardContent}>
                <View style={styles.cardHeaderRow}>
                    <Text style={[
                        styles.cardTitle,
                        item.isRead ? styles.textNormal : styles.textBold
                    ]}>
                        {item.title}
                    </Text>
                    {!item.isRead && <View style={styles.unreadDot} />}
                </View>

                <Text style={styles.cardMessage} numberOfLines={2}>
                    {item.message}
                </Text>

                <View style={styles.timeRow}>
                    <Clock size={12} color="#94A3B8" style={styles.clockIcon} />
                    <Text style={styles.timeText}>
                        {formatTimeAgo(item.createdAt)} • {item.courseCode}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={styles.loadingText}>Đang tải thông báo...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563EB"]} />
                }
            >
                {/* HEADER */}
                <View style={styles.headerContainer}>
                    <View style={styles.iconBox}>
                        <Bell size={24} color="#2563EB" />
                    </View>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>Thông báo</Text>
                        <Text style={styles.headerSubtitle}>
                            Bạn có <Text style={styles.unreadCount}>{notifications.filter(n => !n.isRead).length}</Text> thông báo chưa đọc
                        </Text>
                    </View>
                </View>

                {notifications.length === 0 ? (
                    <View style={styles.emptyStateContainer}>
                        <Bell size={60} color="#CBD5E1" />
                        <Text style={styles.emptyStateText}>Không có thông báo nào</Text>
                    </View>
                ) : (
                    <>
                        {/* DANH SÁCH HÔM NAY */}
                        {todayNotifications.length > 0 && (
                            <>
                                <Text style={styles.sectionTitle}>Hôm nay</Text>
                                {todayNotifications.map(renderItem)}
                            </>
                        )}

                        {/* DANH SÁCH CŨ */}
                        {oldNotifications.length > 0 && (
                            <>
                                <Text style={[
                                    styles.sectionTitle,
                                    todayNotifications.length > 0 && styles.sectionMarginTop
                                ]}>
                                    Trước đó
                                </Text>
                                {oldNotifications.map(renderItem)}
                            </>
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
}