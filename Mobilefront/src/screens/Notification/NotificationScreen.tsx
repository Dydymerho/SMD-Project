import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Bell, CheckCircle, Info, AlertCircle } from "lucide-react-native";

const notifications = [
    {
        id: "1",
        title: "Thông báo hệ thống",
        description: "Hệ thống sẽ bảo trì lúc 22:00 hôm nay.",
        time: "10 phút trước",
        icon: <AlertCircle size={22} color="#DC2626" />,
    },
    {
        id: "2",
        title: "Cập nhật giao diện",
        description: "Giao diện mới đã được áp dụng.",
        time: "1 giờ trước",
        icon: <Info size={22} color="#2563EB" />,
    },
    {
        id: "3",
        title: "Hoàn thành khóa học",
        description: "Bạn đã hoàn thành khóa React Native.",
        time: "Hôm qua",
        icon: <CheckCircle size={22} color="#16A34A" />,
    },
];

export default function NotificationScreen() {
    return (
        <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
            <ScrollView contentContainerStyle={{ padding: 16 }}>

                {/* HEADER */}
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                    <Bell size={24} color="#2563EB" />
                    <Text style={{ fontSize: 20, fontWeight: "600", marginLeft: 8 }}>
                        Thông báo mới
                    </Text>
                </View>

                {/* LIST */}
                {notifications.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.7}
                        style={{
                            flexDirection: "row",
                            backgroundColor: "#FFFFFF",
                            padding: 14,
                            borderRadius: 12,
                            marginBottom: 12,
                            elevation: 1,
                        }}
                    >
                        {/* ICON */}
                        <View style={{ marginRight: 12, marginTop: 2 }}>
                            {item.icon}
                        </View>

                        {/* CONTENT */}
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 15, fontWeight: "600", marginBottom: 4 }}>
                                {item.title}
                            </Text>
                            <Text style={{ fontSize: 13, color: "#64748B", marginBottom: 6 }}>
                                {item.description}
                            </Text>
                            <Text style={{ fontSize: 11, color: "#94A3B8" }}>
                                {item.time}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                    <Bell size={24} color="#2563EB" />
                    <Text style={{ fontSize: 20, fontWeight: "600", marginLeft: 8 }}>
                        Hôm nay
                    </Text>

                </View>
                {notifications.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.7}
                        style={{
                            flexDirection: "row",
                            backgroundColor: "#FFFFFF",
                            padding: 14,
                            borderRadius: 12,
                            marginBottom: 12,
                            elevation: 1,
                        }}
                    >
                        {/* ICON */}
                        <View style={{ marginRight: 12, marginTop: 2 }}>
                            {item.icon}
                        </View>

                        {/* CONTENT */}
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 15, fontWeight: "600", marginBottom: 4 }}>
                                {item.title}
                            </Text>
                            <Text style={{ fontSize: 13, color: "#64748B", marginBottom: 6 }}>
                                {item.description}
                            </Text>
                            <Text style={{ fontSize: 11, color: "#94A3B8" }}>
                                {item.time}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                    <Bell size={24} color="#2563EB" />
                    <Text style={{ fontSize: 20, fontWeight: "600", marginLeft: 8 }}>
                        Trước đó
                    </Text>
                </View>
                {notifications.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.7}
                        style={{
                            flexDirection: "row",
                            backgroundColor: "#FFFFFF",
                            padding: 14,
                            borderRadius: 12,
                            marginBottom: 12,
                            elevation: 1,
                        }}
                    >
                        {/* ICON */}
                        <View style={{ marginRight: 12, marginTop: 2 }}>
                            {item.icon}
                        </View>

                        {/* CONTENT */}
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 15, fontWeight: "600", marginBottom: 4 }}>
                                {item.title}
                            </Text>
                            <Text style={{ fontSize: 13, color: "#64748B", marginBottom: 6 }}>
                                {item.description}
                            </Text>
                            <Text style={{ fontSize: 11, color: "#94A3B8" }}>
                                {item.time}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}
