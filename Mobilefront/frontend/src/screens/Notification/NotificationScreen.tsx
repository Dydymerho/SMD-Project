import React, { useEffect, useState, useCallback } from "react";
import {
    View, Text, ScrollView, TouchableOpacity,
    ActivityIndicator, RefreshControl, Image
} from "react-native";
import { Bell, CheckCircle, Info, AlertCircle, Clock } from "lucide-react-native";
import { NotificationApi } from "../../../..//backend/api/NotificationApi";
import { Notification } from "../../../../backend/types/Notification";

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

// Helper function để chọn icon dựa trên loại thông báo
const getIcon = (type: string) => {
    switch (type) {
        case "SYSTEM":
            return <AlertCircle size={24} color="#DC2626" />; // Đỏ
        case "UPDATE":
            return <Info size={24} color="#2563EB" />; // Xanh dương
        case "SUCCESS":
            return <CheckCircle size={24} color="#16A34A" />; // Xanh lá
        default:
            return <Bell size={24} color="#F59E0B" />; // Vàng cam mặc định
    }
};

export default function NotificationScreen() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Hàm gọi API
    const fetchNotifications = async () => {
        try {
            const res = await NotificationApi.getAll(0, 50); // Lấy 50 thông báo mới nhất
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

    // Render một item thông báo
    const renderItem = (item: Notification) => (
        <TouchableOpacity
            key={item.notificationId}
            activeOpacity={0.7}
            style={{
                flexDirection: "row",
                backgroundColor: item.isRead ? "#FFFFFF" : "#EBF5FF",
                padding: 14,
                borderRadius: 12,
                marginBottom: 12,
                elevation: item.isRead ? 1 : 2,
                borderLeftWidth: item.isRead ? 0 : 4,
                borderLeftColor: "#2563EB"
            }}
            onPress={async () => {
                if (!item.isRead) {
                    await NotificationApi.markAsRead(item.notificationId);
                    setNotifications(prev => prev.map(n =>
                        n.notificationId === item.notificationId ? { ...n, isRead: true } : n
                    ));
                }
                console.log("Mở thông báo:", item.title);
            }}
        >
            {/* ICON */}
            <View style={{ marginRight: 12, marginTop: 2 }}>
                {getIcon(item.type)}
            </View>

            {/* CONTENT */}
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 15, fontWeight: item.isRead ? "600" : "700", marginBottom: 4, flex: 1, color: "#1E293B" }}>
                        {item.title}
                    </Text>
                    {!item.isRead && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#2563EB', marginTop: 6 }} />}
                </View>

                <Text style={{ fontSize: 13, color: "#64748B", marginBottom: 6 }} numberOfLines={2}>
                    {item.message}
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Clock size={12} color="#94A3B8" style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: 11, color: "#94A3B8" }}>
                        {formatTimeAgo(item.createdAt)} • {item.courseCode}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" }}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={{ marginTop: 10, color: "#64748B" }}>Đang tải thông báo...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
            <ScrollView
                contentContainerStyle={{ padding: 16 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563EB"]} />
                }
            >
                {/* HEADER */}
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
                    <View style={{ backgroundColor: '#DBEAFE', padding: 8, borderRadius: 8 }}>
                        <Bell size={24} color="#2563EB" />
                    </View>
                    <View style={{ marginLeft: 12 }}>
                        <Text style={{ fontSize: 20, fontWeight: "700", color: "#0F172A" }}>
                            Thông báo
                        </Text>
                        <Text style={{ fontSize: 13, color: "#64748B" }}>
                            Bạn có <Text style={{ fontWeight: 'bold', color: '#2563EB' }}>{notifications.filter(n => !n.isRead).length}</Text> thông báo chưa đọc
                        </Text>
                    </View>
                </View>

                {notifications.length === 0 ? (
                    <View style={{ alignItems: 'center', marginTop: 50 }}>
                        <Bell size={60} color="#CBD5E1" />
                        <Text style={{ marginTop: 16, fontSize: 16, color: "#94A3B8" }}>Không có thông báo nào</Text>
                    </View>
                ) : (
                    <>
                        {/* danh sach hom nay */}
                        {todayNotifications.length > 0 && (
                            <>
                                <Text style={{ fontSize: 16, fontWeight: "600", color: "#334155", marginBottom: 12, marginTop: 4 }}>
                                    Hôm nay
                                </Text>
                                {todayNotifications.map(renderItem)}
                            </>
                        )}

                        {/* danh sach cu */}
                        {oldNotifications.length > 0 && (
                            <>
                                <Text style={{ fontSize: 16, fontWeight: "600", color: "#334155", marginBottom: 12, marginTop: todayNotifications.length > 0 ? 16 : 4 }}>
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