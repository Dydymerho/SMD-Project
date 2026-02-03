import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Linking, Alert } from "react-native";
import { Info, CheckCircle, Mail, Globe, ShieldCheck, Box } from "lucide-react-native"; // Icon đẹp
import styles from "./About.styles";

export default function AboutScreen() {

    const handleContact = (type: 'email' | 'web') => {
        const url = type === 'email' ? 'mailto:support@smd.edu.vn' : 'https://smd.edu.vn';
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                Alert.alert("Lỗi", "Không thể mở liên kết này.");
            }
        });
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* 1. HEADER & LOGO */}
                <View style={styles.headerContainer}>
                    <View style={styles.logoBox}>
                        <Box size={40} color="#3B82F6" />
                    </View>
                    <Text style={styles.appName}>SMD University App</Text>
                    <View style={styles.versionBadge}>
                        <Text style={styles.versionText}>Phiên bản 1.0.2 (Build 2025)</Text>
                    </View>
                </View>

                {/* 2. GIỚI THIỆU */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Info size={20} color="#3B82F6" />
                        <Text style={styles.cardTitle}>Về ứng dụng</Text>
                    </View>
                    <Text style={styles.descriptionText}>
                        Ứng dụng SMD là nền tảng quản lý đào tạo toàn diện, được thiết kế để hỗ trợ sinh viên và giảng viên tối ưu hóa quy trình học tập và giảng dạy.
                        {"\n\n"}
                        Chúng tôi cam kết mang lại trải nghiệm người dùng hiện đại, tốc độ truy cập nhanh chóng và bảo mật dữ liệu tuyệt đối.
                    </Text>
                </View>

                {/* 3. TÍNH NĂNG NỔI BẬT */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <ShieldCheck size={20} color="#10B981" />
                        <Text style={styles.cardTitle}>Tính năng chính</Text>
                    </View>

                    <View style={styles.featureItem}>
                        <CheckCircle size={18} color="#10B981" style={{ marginTop: 2 }} />
                        <Text style={styles.featureText}>Tra cứu lộ trình học tập, thông tin môn học và tài liệu tham khảo chi tiết.</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <CheckCircle size={18} color="#10B981" style={{ marginTop: 2 }} />
                        <Text style={styles.featureText}>Hệ thống thông báo thời gian thực về lịch học, điểm số và tin tức nhà trường.</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <CheckCircle size={18} color="#10B981" style={{ marginTop: 2 }} />
                        <Text style={styles.featureText}>Giao diện trực quan, hỗ trợ chế độ tối (Dark Mode) và đa nền tảng.</Text>
                    </View>
                </View>

                {/* 4. LIÊN HỆ */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Mail size={20} color="#F59E0B" />
                        <Text style={styles.cardTitle}>Liên hệ hỗ trợ</Text>
                    </View>
                    <Text style={[styles.descriptionText, { marginBottom: 12 }]}>
                        Đội ngũ phát triển luôn sẵn sàng lắng nghe ý kiến đóng góp của bạn để hoàn thiện sản phẩm.
                    </Text>

                    <TouchableOpacity style={styles.contactRow} onPress={() => handleContact('email')}>
                        <Mail size={18} color="#2563EB" />
                        <Text style={styles.contactText}>support@smd.edu.vn</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.contactRow} onPress={() => handleContact('web')}>
                        <Globe size={18} color="#2563EB" />
                        <Text style={styles.contactText}>www.smd.edu.vn</Text>
                    </TouchableOpacity>
                </View>

                {/* FOOTER */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>© 2025 SMD Education Technology.</Text>
                    <Text style={styles.footerText}>All rights reserved.</Text>
                </View>

            </ScrollView>
        </View>
    );
}