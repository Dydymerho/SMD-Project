import { View, Text, TextInput, ScrollView, TouchableOpacity, StatusBar } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import styles from "./Home.styles"
import Icon from "react-native-vector-icons/MaterialIcons"
import { SUBJECTS } from "../../mock/Subject"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { HomeStackParamList } from "../../navigation/HomeStack"

export default function HomeScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>()

    return (
        <SafeAreaView style={styles.safe} edges={["top"]}>
            <StatusBar barStyle="light-content" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
                {/* Header Section */}
                <View style={styles.header}>
                    <Text style={styles.greeting}>Xin chào Tiến 👋</Text>
                    <Text style={styles.subText}>Học kỳ: HK1 — 2025</Text>

                    <View style={styles.searchWrapper}>
                        <Icon name="search" style={styles.searchIcon} />
                        <TextInput
                            placeholder="Tìm môn học hoặc mã môn..."
                            placeholderTextColor="#64748B"
                            style={styles.SearchBar}
                        />
                    </View>
                </View>

                {/* Main Content */}
                <View style={styles.content}>
                    <Text style={styles.sectionTitle}>Khóa học của bạn</Text>

                    <View style={styles.courseList}>
                        {SUBJECTS.map((subject) => (
                            <CourseItem
                                key={subject.code}
                                code={subject.code}
                                name={subject.name}
                                highlight={subject.code === "OOP236"}
                                onPress={() =>
                                    navigation.navigate("SubjectDetail", {
                                        code: subject.code,
                                        name: subject.name,
                                    })
                                }
                            />
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

/* ---------------- COMPONENTS ---------------- */

function CourseItem({
    code,
    name,
    highlight,
    onPress,
}: {
    code: string
    name: string
    highlight?: boolean
    onPress?: () => void
}) {
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.courseItem, highlight && styles.courseItemHighlight]}
            onPress={onPress}
        >
            <View style={styles.courseInfo}>
                <Text style={[styles.courseCode, highlight && styles.courseCodeHighlight]}>{code}</Text>
                <Text style={styles.courseName}>{name}</Text>
            </View>
            <Icon name="chevron-right" style={[styles.arrowIcon, highlight && styles.arrowIconHighlight]} />
        </TouchableOpacity>
    )
}
