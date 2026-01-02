import React, { useState } from 'react';
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
import { SUBJECTS } from '../../mock/Subject';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/HomeStack';

// Hoặc: import Icon from 'react-native-vector-icons/Ionicons';
export default function HomeScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
    // const [major, setMajor] = useState('ALL');
    // const [code, setCode] = useState('');

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
                    {SUBJECTS.map(subject => (
                        <CourseItem
                            key={subject.code}
                            onPress={() =>
                                navigation.navigate('SubjectDetail', { code: subject.code, name: subject.name })
                            }
                            code={subject.code}
                            name={subject.name}
                            highlight={subject.code === 'OOP236'}

                        />
                    ))}
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
    onPress,
}: {
    code: string;
    name: string;
    highlight?: boolean;
    onPress?: () => void;
}) {
    return (
        <TouchableOpacity style={styles.courseItem} onPress={onPress}>
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


