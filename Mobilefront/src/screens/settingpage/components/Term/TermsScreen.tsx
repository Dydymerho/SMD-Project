import React from "react";
import { View, Text, ScrollView } from "react-native";
import styles from "./Terms.styles";

export default function TermsScreen() {
    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Điều khoản sử dụng</Text>
                <Text style={styles.text}>
                    Khi sử dụng ứng dụng SMD, bạn đồng ý với các điều khoản sau:
                </Text>
                <Text style={styles.sectionTitle}>1. Quyền riêng tư</Text>
                <Text style={styles.text}>
                    Thông tin cá nhân của bạn được bảo mật và chỉ sử dụng cho mục đích quản lý học tập, không chia sẻ cho bên thứ ba.
                </Text>
                <Text style={styles.sectionTitle}>2. Trách nhiệm người dùng</Text>
                <Text style={styles.text}>
                    Bạn chịu trách nhiệm về thông tin tài khoản và các hoạt động của mình trên ứng dụng. Không sử dụng ứng dụng cho mục đích vi phạm pháp luật.
                </Text>
                <Text style={styles.sectionTitle}>3. Thay đổi điều khoản</Text>
                <Text style={styles.text}>
                    Chúng tôi có thể cập nhật điều khoản sử dụng bất kỳ lúc nào. Bạn nên kiểm tra thường xuyên để cập nhật thông tin mới nhất.
                </Text>
            </ScrollView>
        </View>
    );
}
