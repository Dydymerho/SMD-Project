import { View, Text, TextInput, ScrollView, TouchableOpacity, StatusBar, FlatList } from "react-native"
import React, { useState } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { Modal, Pressable } from "react-native"
import styles from "./Home.styles"
import Icon from "react-native-vector-icons/MaterialIcons"
import { SYLLABUS_CONTENT } from "../../mock/Syllabus"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { HomeStackParamList } from "../../navigation/HomeStack"

export default function HomeScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>()
    const syllabus = SYLLABUS_CONTENT;
    const [filterVisible, setFilterVisible] = React.useState(false);
    const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<string | null>(null);
    const [showList, setShowList] = useState(false);
    const [ShowListYear, setShowListYear] = useState(false);

    // Lấy danh sách các khoa duy nhất
    const departments = Array.from(new Set(syllabus.map(s => s.department).filter(Boolean))) as string[];
    const academicYears = Array.from(new Set(syllabus.map(s => s.academicYear).filter(Boolean))) as string[];
    // Lọc theo khoa
    const filteredSyllabus = syllabus.filter(s =>
        (selectedFilter ? s.department === selectedFilter : true) &&
        (selectedYear ? s.academicYear === selectedYear : true)
    );

    return (
        <SafeAreaView style={styles.safe} edges={["top"]}>
            <StatusBar barStyle="light-content" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
                {/* Header Section */}
                <View style={styles.header}>
                    <Text style={styles.greeting}>Xin chào Tiến 👋</Text>
                    <Text style={styles.subText}>Học kỳ: HK1 — 2025</Text>

                    <View style={styles.searchWrapper}>
                        <Icon name="search" size={20} color="#64748B" style={styles.searchIcon} />
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
                    <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }}
                        onPress={() => setFilterVisible(true)}>
                        <Text style={styles.button}>
                            <Icon name="filter-list" />
                            Lọc</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.courseList}>
                    {filteredSyllabus.map((subject) => (
                        <CourseItem
                            key={subject.code ?? ""}
                            code={subject.code ?? ""}
                            name={subject.name ?? ""}
                            highlight={subject.code === "OOP236"}
                            department={subject.department ?? ""}
                            onPress={() =>
                                navigation.navigate("SubjectDetail", {
                                    code: subject.code ?? "",
                                    name: subject.name ?? "",
                                })
                            }
                        />
                    ))}
                </View>
                <Modal
                    visible={filterVisible}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setFilterVisible(false)}>
                    <View style={styles.filter_container}>
                        <View style={styles.filter_tag}>
                            <Text style={styles.filter_choices}>Bộ lọc</Text>
                            <Pressable
                                style={styles.filter_elements}
                                onPress={() => setShowList(!showList)}
                            >
                                <Text style={styles.title_button}>
                                    {showList ? 'Ẩn danh sách' : 'Chọn khoa'}
                                </Text>
                            </Pressable>
                            {showList && (
                                <FlatList
                                    data={['Tất cả', ...departments]}
                                    keyExtractor={(item) => item}
                                    renderItem={({ item }) => (
                                        <Pressable
                                            style={styles.filter_elements}
                                            onPress={() => {
                                                setSelectedFilter(item === 'Tất cả' ? null : item);
                                                setShowList(false);
                                                setFilterVisible(false);
                                            }}
                                        >
                                            <Text style={styles.title_button}>{item}</Text>
                                        </Pressable>
                                    )}
                                />
                            )}
                            <Pressable
                                style={styles.filter_elements}
                                onPress={() => setShowListYear(!ShowListYear)}
                            >
                                <Text style={styles.title_button}>
                                    {ShowListYear ? 'Ẩn danh sách' : 'Chọn năm học'}
                                </Text>
                            </Pressable>
                            {ShowListYear && (
                                <FlatList
                                    data={['Tất cả', ...academicYears]}
                                    keyExtractor={(item) => item}
                                    renderItem={({ item }) => (
                                        <Pressable
                                            style={styles.filter_elements}
                                            onPress={() => {
                                                setSelectedYear(item === 'Tất cả' ? null : item);
                                                setShowListYear(false);
                                                setFilterVisible(false);
                                            }}
                                        >
                                            <Text style={styles.title_button}>{item}</Text>
                                        </Pressable>
                                    )}
                                />
                            )}
                            <Pressable
                                style={styles.filter_elements}
                                onPress={() => setFilterVisible(false)}>
                                <Text style={styles.title_button}>Đóng</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </SafeAreaView >
    )
}

/* ---------------- COMPONENTS ---------------- */

function CourseItem({
    code,
    name,
    department,
    highlight,
    onPress,
}: {
    code: string
    name: string
    department: string
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
                <Text style={styles.courseCode}>{department}</Text>
            </View>
            <Icon name="school" size={22} color={highlight ? "#3B82F6" : "#334155"} style={[styles.arrowIcon, highlight && styles.arrowIconHighlight]} />
        </TouchableOpacity>
    )
}
