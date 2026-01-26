import { View, Text, TextInput, ScrollView, TouchableOpacity, StatusBar, FlatList, RefreshControl, ActivityIndicator } from "react-native"
import React, { useState, useEffect } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { Modal, Pressable } from "react-native"
import styles from "./Home.styles"
import Icon from "react-native-vector-icons/MaterialIcons"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { HomeStackParamList } from "../../navigation/HomeStack"
import { CourseApi } from "../../../../backend/api/CourseApi"
import { Courses } from "../../../../backend/api/types/Courses"

export default function HomeScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>()
    const [courses, setCourses] = useState<Courses[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchText, setSearchText] = useState("");
    const [filterVisible, setFilterVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<string | null>(null);
    const [showList, setShowList] = useState(false);
    const [showListYear, setShowListYear] = useState(false);

    // Fetch dữ liệu lần đầu
    useEffect(() => {
        fetchSyllabus();
    }, []);

    const fetchSyllabus = async () => {
        try {
            setError(null);
            console.log("🔄 Đang gọi API...");
            const data = await CourseApi.getMySyllabus();
            console.log("✅ API thành công, data nhận được:", data);
            console.log("📊 Số lượng môn học:", data.length);
            setCourses(data);
        } catch (error: any) {
            console.error("❌ Error fetching syllabus:", error);
            console.error("Error message:", error.message);
            console.error("Error response:", error.response?.data);
            console.error("Error status:", error.response?.status);
            console.error("Error config:", error.config?.url);

            // Phân loại error chi tiết hơn
            if (error.message === "Network Error") {
                setError("Không có kết nối mạng. Vui lòng kiểm tra internet.");
            } else if (error.response?.status === 404) {
                setError("Không tìm thấy API endpoint. Vui lòng liên hệ quản trị viên.");
            } else if (error.response?.status === 500) {
                setError("Server đang gặp sự cố. Vui lòng thử lại sau.");
            } else if (error.response?.status === 401) {
                setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
            } else {
                setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Xử lý refresh
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchSyllabus();
    };

    // Lấy danh sách các khoa duy nhất
    const departments = Array.from(new Set(courses.map(s => s.deptName).filter(Boolean))) as string[];
    const academicYears = Array.from(new Set(courses.map(s => s.academicYear).filter(Boolean))) as string[];

    // Chuẩn hóa search text
    const normalizedSearchText = searchText.trim().toLowerCase();

    // Lọc dữ liệu
    const filteredSyllabus = courses.filter(s => {
        const matchDepartment = selectedFilter ? s.deptName === selectedFilter : true;
        const matchYear = selectedYear ? s.academicYear === selectedYear : true;
        const matchSearch = normalizedSearchText
            ? (s.courseName?.toLowerCase().includes(normalizedSearchText) ||
                s.courseCode?.toLowerCase().includes(normalizedSearchText))
            : true;
        return matchDepartment && matchYear && matchSearch;
    });

    // Hiển thị loading
    if (loading && !refreshing) {
        return (
            <SafeAreaView style={styles.safe} edges={["top"]}>
                <StatusBar barStyle="light-content" />
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe} edges={["top"]}>
            <StatusBar barStyle="light-content" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.container}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#007AFF"
                        colors={["#007AFF"]}
                    />
                }
            >
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
                            value={searchText}
                            onChangeText={setSearchText}
                            returnKeyType="search"
                        />
                        {searchText.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchText("")}>
                                <Icon name="close" size={20} color="#64748B" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Main Content */}
                <View style={styles.content}>
                    <Text style={styles.sectionTitle}>Khóa học của bạn</Text>
                    <View style={styles.filterRow}>
                        <TouchableOpacity
                            style={styles.filterButton}
                            onPress={() => setFilterVisible(true)}
                        >
                            <Icon name="filter-list" size={20} color="#007AFF" />
                            <Text style={styles.filterButtonText}>Lọc</Text>
                        </TouchableOpacity>

                        {/* Hiển thị filter active */}
                        {(selectedFilter || selectedYear) && (
                            <TouchableOpacity
                                style={styles.clearFilterButton}
                                onPress={() => {
                                    setSelectedFilter(null);
                                    setSelectedYear(null);
                                }}
                            >
                                <Text style={styles.clearFilterText}>Xóa bộ lọc</Text>
                                <Icon name="close" size={16} color="#FF3B30" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Hiển thị filter đang áp dụng */}
                    {(selectedFilter || selectedYear) && (
                        <View style={styles.activeFilters}>
                            {selectedFilter && (
                                <View style={styles.filterChip}>
                                    <Text style={styles.filterChipText}>Khoa: {selectedFilter}</Text>
                                </View>
                            )}
                            {selectedYear && (
                                <View style={styles.filterChip}>
                                    <Text style={styles.filterChipText}>Năm: {selectedYear}</Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>

                {/* Hiển thị lỗi */}
                {error && (
                    <View style={styles.errorContainer}>
                        <Icon name="error-outline" size={40} color="#FF3B30" />
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={fetchSyllabus}
                        >
                            <Text style={styles.retryButtonText}>Thử lại</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Danh sách khóa học */}
                <View style={styles.courseList}>
                    {filteredSyllabus.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Icon name="search-off" size={60} color="#C7C7CC" />
                            <Text style={styles.emptyText}>
                                {searchText || selectedFilter || selectedYear
                                    ? "Không tìm thấy môn học phù hợp"
                                    : "Chưa có môn học nào"}
                            </Text>
                            {(searchText || selectedFilter || selectedYear) && (
                                <TouchableOpacity
                                    style={styles.clearSearchButton}
                                    onPress={() => {
                                        setSearchText("");
                                        setSelectedFilter(null);
                                        setSelectedYear(null);
                                    }}
                                >
                                    <Text style={styles.clearSearchText}>Xóa tìm kiếm và bộ lọc</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        filteredSyllabus.map((subject) => (
                            <CourseItem
                                key={`${subject.courseCode}-${subject.academicYear}`}
                                code={subject.courseCode ?? ""}
                                name={subject.courseName ?? ""}
                                author={subject.username ?? ""}
                                academicYear={subject.academicYear ?? ""}
                                credits={subject.credits ?? 0}
                                description={subject.aiSummary ?? ""}
                                department={subject.deptName ?? ""}
                                onPress={() =>
                                    navigation.navigate("SubjectDetail", {
                                        code: subject.courseCode ?? "",
                                        name: subject.courseName ?? "",
                                    })
                                }
                            />
                        ))
                    )}
                </View>

                {/* Modal Filter */}
                <Modal
                    visible={filterVisible}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setFilterVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.filterModal}>
                            <View style={styles.filterHeader}>
                                <Text style={styles.filterTitle}>Bộ lọc</Text>
                                <TouchableOpacity onPress={() => setFilterVisible(false)}>
                                    <Icon name="close" size={24} color="#000" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.filterContent}>
                                {/* Filter theo khoa */}
                                <View style={styles.filterSection}>
                                    <Text style={styles.filterSectionTitle}>Chọn khoa</Text>
                                    <Pressable
                                        style={styles.filterDropdown}
                                        onPress={() => {
                                            setShowList(!showList);
                                            setShowListYear(false);
                                        }}
                                    >
                                        <Text style={styles.filterDropdownText}>
                                            {selectedFilter || "Tất cả các khoa"}
                                        </Text>
                                        <Icon
                                            name={showList ? "expand-less" : "expand-more"}
                                            size={24}
                                            color="#64748B"
                                        />
                                    </Pressable>
                                    {showList && (
                                        <View style={styles.filterList}>
                                            {['Tất cả', ...departments].map((item) => (
                                                <Pressable
                                                    key={item}
                                                    style={[
                                                        styles.filterOption,
                                                        selectedFilter === (item === 'Tất cả' ? null : item) &&
                                                        styles.filterOptionSelected
                                                    ]}
                                                    onPress={() => {
                                                        setSelectedFilter(item === 'Tất cả' ? null : item);
                                                        setShowList(false);
                                                    }}
                                                >
                                                    <Text style={[
                                                        styles.filterOptionText,
                                                        selectedFilter === (item === 'Tất cả' ? null : item) &&
                                                        styles.filterOptionTextSelected
                                                    ]}>
                                                        {item}
                                                    </Text>
                                                    {selectedFilter === (item === 'Tất cả' ? null : item) && (
                                                        <Icon name="check" size={20} color="#007AFF" />
                                                    )}
                                                </Pressable>
                                            ))}
                                        </View>
                                    )}
                                </View>

                                {/* Filter theo năm học */}
                                <View style={styles.filterSection}>
                                    <Text style={styles.filterSectionTitle}>Chọn năm học</Text>
                                    <Pressable
                                        style={styles.filterDropdown}
                                        onPress={() => {
                                            setShowListYear(!showListYear);
                                            setShowList(false);
                                        }}
                                    >
                                        <Text style={styles.filterDropdownText}>
                                            {selectedYear || "Tất cả các năm"}
                                        </Text>
                                        <Icon
                                            name={showListYear ? "expand-less" : "expand-more"}
                                            size={24}
                                            color="#64748B"
                                        />
                                    </Pressable>
                                    {showListYear && (
                                        <View style={styles.filterList}>
                                            {['Tất cả', ...academicYears].map((item) => (
                                                <Pressable
                                                    key={item}
                                                    style={[
                                                        styles.filterOption,
                                                        selectedYear === (item === 'Tất cả' ? null : item) &&
                                                        styles.filterOptionSelected
                                                    ]}
                                                    onPress={() => {
                                                        setSelectedYear(item === 'Tất cả' ? null : item);
                                                        setShowListYear(false);
                                                    }}
                                                >
                                                    <Text style={[
                                                        styles.filterOptionText,
                                                        selectedYear === (item === 'Tất cả' ? null : item) &&
                                                        styles.filterOptionTextSelected
                                                    ]}>
                                                        {item}
                                                    </Text>
                                                    {selectedYear === (item === 'Tất cả' ? null : item) && (
                                                        <Icon name="check" size={20} color="#007AFF" />
                                                    )}
                                                </Pressable>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            </ScrollView>

                            <View style={styles.filterFooter}>
                                <TouchableOpacity
                                    style={styles.filterCancelButton}
                                    onPress={() => {
                                        setSelectedFilter(null);
                                        setSelectedYear(null);
                                        setFilterVisible(false);
                                    }}
                                >
                                    <Text style={styles.filterCancelText}>Xóa bộ lọc</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.filterApplyButton}
                                    onPress={() => setFilterVisible(false)}
                                >
                                    <Text style={styles.filterApplyText}>Áp dụng</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </SafeAreaView>
    )
}

/* ---------------- COMPONENTS ---------------- */

function CourseItem({
    code,
    name,
    department,
    author,
    credits,
    academicYear,
    description,
    onPress,
}: {
    code: string
    name: string
    department: string
    author: string
    credits: number
    academicYear: string
    description: string
    highlight?: boolean
    onPress?: () => void
}) {
    return (
        <TouchableOpacity
            style={styles.courseCard}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {/* HEADER */}
            <View style={styles.cardHeader}>
                <View style={styles.codeBadge}>
                    <Text style={styles.codeText}>{code}</Text>
                </View>
                <Text style={styles.courseTitle} numberOfLines={2}>{name}</Text>
            </View>

            {/* BODY */}
            <View style={styles.cardBody}>
                <View style={styles.courseInfoRow}>
                    <Icon name="apartment" size={16} color="#64748B" />
                    <Text style={styles.courseInfoText}>Viện: {department}</Text>
                </View>
                <View style={styles.courseInfoRow}>
                    <Icon name="person" size={16} color="#64748B" />
                    <Text style={styles.courseInfoText}>Người đăng: {author}</Text>
                </View>
                <View style={styles.courseInfoRow}>
                    <Icon name="calendar-today" size={16} color="#64748B" />
                    <Text style={styles.courseInfoText}>Năm học: {academicYear}</Text>
                </View>
                <View style={styles.courseInfoRow}>
                    <Icon name="library-books" size={16} color="#64748B" />
                    <Text style={styles.courseInfoText}>Tín chỉ: {credits}</Text>
                </View>

                {/* DESCRIPTION */}
                {description && (
                    <View style={styles.descriptionBox}>
                        <Text style={styles.descriptionTitle}>Giới thiệu học phần</Text>
                        <Text style={styles.descriptionText} numberOfLines={3}>
                            {description}
                        </Text>
                    </View>
                )}

                {/* BUTTON */}
                <View style={styles.cardFooter}>
                    <Text style={styles.viewDetailText}>Xem chi tiết</Text>
                    <Icon name="arrow-forward" size={20} color="#007AFF" />
                </View>
            </View>
        </TouchableOpacity>
    )
}