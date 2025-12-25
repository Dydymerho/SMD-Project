import React from "react";
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Image
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from './Home.styles';
import Icon from 'react-native-vector-icons/MaterialIcons';
// Hoặc: import Icon from 'react-native-vector-icons/Ionicons';
export default function HomeScreen() {
    const insets = useSafeAreaInsets();

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>

            {/* CONTENT */}
            <ScrollView

                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                {/* Greeting */}
                <Text style={styles.greeting}>Xin chào Tiến👋</Text>
                <Text style={styles.subText}>Học kỳ: HK1 - 2025</Text>

                {/* Search */}


                <View style={styles.searchContainer}>
                    <TextInput
                        placeholder="Tìm môn học / mã môn"
                        placeholderTextColor="#999"
                        style={styles.SearchBar}
                    />
                    <Icon name="search" style={styles.icon} />
                </View>
                {/* Suggestions */}
                <Section title="Các khóa học của bạn">
                    <CourseItem code="CT101" name="Cấu trúc dữ liệu" />
                    <CourseItem code="IT203" name="Lập trình Web" />
                    <CourseItem code="OOP236" name="Java" />
                    <CourseItem code="SAD205" name="Phân tích thiết kế hệ thống" />
                    <CourseItem code="NET301" name="Mạng máy tính" />
                    <CourseItem code="OS401" name="Hệ điều hành" />
                    <CourseItem code="AI501" name="Trí tuệ nhân tạo" />
                    <CourseItem code="SE301" name="Kỹ thuật phần mềm" />
                    <CourseItem code="MB401" name="Lập trình di động" />
                </Section>
            </ScrollView>
        </SafeAreaView>
    );
}

/* ---------------- COMPONENTS ---------------- */

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.card}>{children}</View>
        </View>
    );
}

function CourseItem({
    code,
    name,
    highlight,
}: {
    code: string;
    name: string;
    highlight?: boolean;
}) {
    return (
        <TouchableOpacity style={styles.courseItem}>
            <Text
                style={[
                    styles.courseCode,
                    highlight && { color: '#FF8A00' },
                ]}
            >
                {code}
            </Text>
            <Text style={styles.courseName}>{name}</Text>
        </TouchableOpacity>
    );
}


