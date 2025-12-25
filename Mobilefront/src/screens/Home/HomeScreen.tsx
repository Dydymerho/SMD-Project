import React from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from './Home.styles';

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
                <Text style={styles.subText}>Bạn đang học học kỳ 5</Text>

                {/* Search */}
                <TextInput
                    placeholder="Tìm môn học / mã môn"
                    placeholderTextColor="#999"
                    style={styles.search}
                />

                {/* Suggestions */}
                <Section title="Gợi ý cho bạn">
                    <CourseItem code="CT101" name="Cấu trúc dữ liệu" />
                    <CourseItem code="IT203" name="Lập trình Web" />
                </Section>

                {/* Updated */}
                <Section title="Giáo trình mới cập nhật">
                    <CourseItem code="OOP" name="Java" highlight />
                    <CourseItem code="NET" name="Mạng máy tính" />
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


