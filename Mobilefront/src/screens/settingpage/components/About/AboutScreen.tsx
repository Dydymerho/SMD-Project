import React from "react";
import { View, Text, ScrollView } from "react-native";
import styles from "./About.styles";

export default function AboutScreen() {
    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Giới thiệu ứng dụng SMD</Text>
                <Text style={styles.text}>
                    Ứng dụng SMD hỗ trợ sinh viên và giảng viên quản lý, tra cứu thông tin môn học, lộ trình học tập, tài liệu và các chức năng liên quan đến đào tạo. Chúng tôi cam kết mang lại trải nghiệm thuận tiện, hiện đại và bảo mật cho người dùng.
                </Text>
                <Text style={styles.sectionTitle}>Tính năng chính</Text>
                <Text style={styles.text}>
                    - Tra cứu thông tin môn học, tài liệu, lộ trình học tập.
                    {"\n"}- Quản lý tài khoản cá nhân, thông báo hệ thống.
                    {"\n"}- Giao diện thân thiện, hỗ trợ đa nền tảng.
                </Text>
                <Text style={styles.sectionTitle}>Liên hệ</Text>
                <Text style={styles.text}>
                    Mọi thắc mắc hoặc góp ý, vui lòng liên hệ: support@smd.edu.vn
                </Text>
            </ScrollView>
        </View>
    );
}
