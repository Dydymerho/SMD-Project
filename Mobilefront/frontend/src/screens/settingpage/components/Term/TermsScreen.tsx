import React from "react";
import { View, Text, ScrollView } from "react-native";
import { ShieldCheck, UserCheck, RefreshCw, FileText } from "lucide-react-native"; // Icon
import styles from "./Terms.styles";

export default function TermsScreen() {
    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* HEADER */}
                <View style={styles.headerContainer}>
                    <Text style={styles.pageTitle}>Điều khoản sử dụng</Text>
                    <Text style={styles.introText}>
                        Chào mừng bạn đến với ứng dụng SMD. Vui lòng đọc kỹ các điều khoản dưới đây trước khi bắt đầu sử dụng dịch vụ của chúng tôi.
                    </Text>
                    <Text style={styles.lastUpdated}>Cập nhật lần cuối: 01/01/2025</Text>
                </View>

                {/* CARD 1: QUYỀN RIÊNG TƯ */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconBox, { backgroundColor: "#ECFDF5" }]}>
                            <ShieldCheck size={20} color="#10B981" />
                        </View>
                        <Text style={styles.cardTitle}>1. Quyền riêng tư & Bảo mật</Text>
                    </View>
                    <Text style={styles.cardText}>
                        Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn. Dữ liệu như tên, mã số sinh viên, và email chỉ được sử dụng cho mục đích quản lý học tập và đào tạo nội bộ. Chúng tôi tuyệt đối không chia sẻ thông tin này cho bên thứ ba nếu không có sự đồng ý của bạn hoặc yêu cầu từ pháp luật.
                    </Text>
                </View>

                {/* CARD 2: TRÁCH NHIỆM */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconBox, { backgroundColor: "#EFF6FF" }]}>
                            <UserCheck size={20} color="#3B82F6" />
                        </View>
                        <Text style={styles.cardTitle}>2. Trách nhiệm người dùng</Text>
                    </View>
                    <Text style={styles.cardText}>
                        Bạn chịu trách nhiệm bảo mật thông tin tài khoản (tên đăng nhập và mật khẩu). Mọi hành vi sử dụng ứng dụng để gian lận, phá hoại hệ thống hoặc vi phạm quy định nhà trường đều bị nghiêm cấm và có thể dẫn đến việc khóa tài khoản vĩnh viễn.
                    </Text>
                </View>

                {/* CARD 3: THAY ĐỔI ĐIỀU KHOẢN */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconBox, { backgroundColor: "#FFFBEB" }]}>
                            <RefreshCw size={20} color="#F59E0B" />
                        </View>
                        <Text style={styles.cardTitle}>3. Cập nhật & Thay đổi</Text>
                    </View>
                    <Text style={styles.cardText}>
                        Chúng tôi có quyền cập nhật hoặc chỉnh sửa các điều khoản này bất kỳ lúc nào để phù hợp với quy định mới hoặc nâng cấp hệ thống. Việc bạn tiếp tục sử dụng ứng dụng sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận các điều khoản mới.
                    </Text>
                </View>

                {/* FOOTER NOTE */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Bằng việc đăng nhập và sử dụng ứng dụng, bạn xác nhận đã hiểu và đồng ý với các điều khoản trên.
                    </Text>
                </View>

            </ScrollView>
        </View>
    );
}