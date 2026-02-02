import React, { useState, useEffect } from "react";
import {
    View, Text, TextInput, ScrollView, TouchableOpacity,
    StatusBar, RefreshControl, ActivityIndicator,
    Modal, Pressable
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import LinearGradient from "react-native-linear-gradient"; // Cần cài thư viện này

// --- IMPORTS CUSTOM ---
import styles from "./Home.styles";
import type { HomeStackParamList } from "../../navigation/HomeStack";
import { CourseApi } from "../../../../backend/api/CourseApi";
import { ProfileApi } from "../../../../backend/api/ProfileApi";
import { Courses } from "../../../../backend/types/Courses";
import { Profile } from "../../../../backend/types/Profile";

export default function HomeScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();

    // --- STATE ---
    const [courses, setCourses] = useState<Courses[]>([]);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Search & Filter
    const [searchText, setSearchText] = useState("");
    const [filterVisible, setFilterVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<string | null>(null);
    const [showList, setShowList] = useState(false);
    const [showListYear, setShowListYear] = useState(false);

    // --- DATA FETCHING ---
    const fetchProfile = async () => {
        try {
            const res: any = await ProfileApi.getMyProfile();
            if (res && res.user) {
                setProfile({ ...res.user, country: res.country || "", timezone: res.timezone || "" });
            } else {
                setProfile(res);
            }
        } catch (error) { console.error(error); }
    };

    const fetchSyllabus = async () => {
        try {
            const data = await CourseApi.getMySyllabus();
            setCourses(data);
        } catch (error: any) {
            console.error(error);
            setError("Không thể tải danh sách môn học.");
        }
    };

    const loadAllData = async () => {
        setError(null);
        try {
            await Promise.all([fetchSyllabus(), fetchProfile()]);
        } catch (e) { console.error(e); }
        finally { setLoading(false); setRefreshing(false); }
    };

    useEffect(() => { loadAllData(); }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadAllData();
    };

    // Filter Logic
    const departments = Array.from(new Set(courses.map(s => s.deptName).filter(Boolean))) as string[];
    const academicYears = Array.from(new Set(courses.map(s => s.academicYear).filter(Boolean))) as string[];
    const normalizedSearchText = searchText.trim().toLowerCase();

    const filteredSyllabus = courses.filter(s => {
        const matchDepartment = selectedFilter ? s.deptName === selectedFilter : true;
        const matchYear = selectedYear ? s.academicYear === selectedYear : true;
        const matchSearch = normalizedSearchText
            ? (s.courseName?.toLowerCase().includes(normalizedSearchText) ||
                s.courseCode?.toLowerCase().includes(normalizedSearchText))
            : true;
        return matchDepartment && matchYear && matchSearch;
    });

    // LOADING VIEW
    if (loading && !refreshing) {
        return (
            <SafeAreaView style={styles.safe} edges={["top"]}>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#15803D" />
                    <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
            <StatusBar barStyle="light-content" backgroundColor="#20331b" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.container}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#15803D" colors={["#15803D"]} />}
            >
                {/* 1. HEADER GRADIENT CAO CẤP */}
                <LinearGradient colors={["#32502a", "#20331b"]} style={styles.header}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <View>
                            <Text style={styles.greeting}>{profile?.fullName ? `Hi, ${profile.fullName}` : "Xin chào"}</Text>
                            <Text style={styles.subText}>Học kỳ I — 2025</Text>
                        </View>
                        {/* Avatar hoặc Icon thông báo nếu cần */}
                        <TouchableOpacity style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 20 }}>
                            <Icon name="notifications-none" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchWrapper}>
                        <Icon name="search" size={24} color="#CBD5E1" style={styles.searchIcon} />
                        <TextInput
                            placeholder="Tìm kiếm môn học..."
                            placeholderTextColor="#94A3B8"
                            style={styles.SearchBar}
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                        {searchText.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchText("")}>
                                <Icon name="close" size={20} color="#CBD5E1" />
                            </TouchableOpacity>
                        )}
                    </View>
                </LinearGradient>

                {/* 2. MAIN CONTENT */}
                <View style={styles.content}>
                    <View style={styles.filterRow}>
                        <Text style={styles.sectionTitle}>Khóa học của bạn</Text>
                        <TouchableOpacity style={styles.filterButton} onPress={() => setFilterVisible(true)}>
                            <Icon name="filter-list" size={20} color="#3b82f6" />
                            <Text style={styles.filterButtonText}>Bộ lọc</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Active Filters */}
                    {(selectedFilter || selectedYear) && (
                        <View style={styles.activeFilters}>
                            {selectedFilter && <View style={styles.filterChip}><Text style={styles.filterChipText}>{selectedFilter}</Text></View>}
                            {selectedYear && <View style={styles.filterChip}><Text style={styles.filterChipText}>{selectedYear}</Text></View>}
                            <TouchableOpacity onPress={() => { setSelectedFilter(null); setSelectedYear(null); }}>
                                <Text style={{ fontSize: 12, color: '#EF4444', fontWeight: '600', marginLeft: 4 }}>Xóa</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Error Message */}
                    {error && (
                        <View style={styles.errorContainer}>
                            <Icon name="error-outline" size={32} color="#EF4444" />
                            <Text style={styles.errorText}>{error}</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={fetchSyllabus}>
                                <Text style={styles.retryButtonText}>Thử lại</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* 3. COURSE LIST */}
                    <View style={styles.courseList}>
                        {filteredSyllabus.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Icon name="folder-open" size={60} color="#CBD5E1" />
                                <Text style={styles.emptyText}>Chưa có môn học nào khớp với tìm kiếm.</Text>
                            </View>
                        ) : (
                            filteredSyllabus.map((subject) => (
                                <CourseItem
                                    key={`${subject.courseCode}-${subject.academicYear}`}
                                    code={subject.courseCode ?? ""}
                                    name={subject.courseName ?? ""}
                                    author={subject.lecturerName ?? "Giảng viên"}
                                    academicYear={subject.academicYear ?? ""}
                                    credits={subject.credit ?? 0}
                                    description={subject.description ?? ""}
                                    department={subject.deptName ?? ""}
                                    onPress={() => navigation.navigate("SubjectDetail", {
                                        code: subject.courseCode ?? "",
                                        name: subject.courseName ?? "",
                                    })}
                                />
                            ))
                        )}
                    </View>
                </View>

                {/* 4. MODAL FILTER */}
                <Modal visible={filterVisible} transparent animationType="slide" onRequestClose={() => setFilterVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.filterModal}>
                            <View style={styles.filterHeader}>
                                <Text style={styles.filterTitle}>Bộ lọc tìm kiếm</Text>
                                <TouchableOpacity onPress={() => setFilterVisible(false)}>
                                    <Icon name="close" size={24} color="#64748B" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.filterContent}>
                                <View style={styles.filterSection}>
                                    <Text style={styles.filterSectionTitle}>Khoa / Viện</Text>
                                    <Pressable style={styles.filterDropdown} onPress={() => { setShowList(!showList); setShowListYear(false); }}>
                                        <Text style={styles.filterDropdownText}>{selectedFilter || "Tất cả"}</Text>
                                        <Icon name={showList ? "expand-less" : "expand-more"} size={24} color="#64748B" />
                                    </Pressable>
                                    {showList && (
                                        <View style={styles.filterList}>
                                            {['Tất cả', ...departments].map((item) => (
                                                <Pressable key={item}
                                                    style={[styles.filterOption, selectedFilter === (item === 'Tất cả' ? null : item) && styles.filterOptionSelected]}
                                                    onPress={() => { setSelectedFilter(item === 'Tất cả' ? null : item); setShowList(false); }}
                                                >
                                                    <Text style={[styles.filterOptionText, selectedFilter === (item === 'Tất cả' ? null : item) && styles.filterOptionTextSelected]}>{item}</Text>
                                                    {selectedFilter === (item === 'Tất cả' ? null : item) && <Icon name="check" size={20} color="#0284C7" />}
                                                </Pressable>
                                            ))}
                                        </View>
                                    )}
                                </View>

                                <View style={styles.filterSection}>
                                    <Text style={styles.filterSectionTitle}>Năm học</Text>
                                    <Pressable style={styles.filterDropdown} onPress={() => { setShowListYear(!showListYear); setShowList(false); }}>
                                        <Text style={styles.filterDropdownText}>{selectedYear || "Tất cả"}</Text>
                                        <Icon name={showListYear ? "expand-less" : "expand-more"} size={24} color="#64748B" />
                                    </Pressable>
                                    {showListYear && (
                                        <View style={styles.filterList}>
                                            {['Tất cả', ...academicYears].map((item) => (
                                                <Pressable key={item}
                                                    style={[styles.filterOption, selectedYear === (item === 'Tất cả' ? null : item) && styles.filterOptionSelected]}
                                                    onPress={() => { setSelectedYear(item === 'Tất cả' ? null : item); setShowListYear(false); }}
                                                >
                                                    <Text style={[styles.filterOptionText, selectedYear === (item === 'Tất cả' ? null : item) && styles.filterOptionTextSelected]}>{item}</Text>
                                                    {selectedYear === (item === 'Tất cả' ? null : item) && <Icon name="check" size={20} color="#0284C7" />}
                                                </Pressable>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            </ScrollView>

                            <View style={styles.filterFooter}>
                                <TouchableOpacity style={styles.filterCancelButton} onPress={() => { setSelectedFilter(null); setSelectedYear(null); setFilterVisible(false); }}>
                                    <Text style={styles.filterCancelText}>Đặt lại</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.filterApplyButton} onPress={() => setFilterVisible(false)}>
                                    <Text style={styles.filterApplyText}>Áp dụng</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </SafeAreaView>
    );
}

// Sub-component CourseItem (Giữ nguyên trong file này hoặc tách ra)
function CourseItem({ code, name, department, author, credits, academicYear, description, onPress }: any) {
    return (
        <TouchableOpacity style={styles.courseCard} onPress={onPress} activeOpacity={0.9}>
            <View style={styles.cardHeader}>
                <View style={styles.codeBadge}>
                    <Text style={styles.codeText}>{code}</Text>
                </View>
                <Text style={styles.courseTitle} numberOfLines={2}>{name}</Text>
            </View>
            <View style={styles.cardBody}>
                <View style={styles.courseInfoRow}><Icon name="apartment" size={16} color="#94A3B8" /><Text style={styles.courseInfoText}>{department}</Text></View>
                <View style={styles.courseInfoRow}><Icon name="person-outline" size={16} color="#94A3B8" /><Text style={styles.courseInfoText}>{author}</Text></View>
                <View style={styles.courseInfoRow}><Icon name="star-outline" size={16} color="#94A3B8" /><Text style={styles.courseInfoText}>{credits} Tín chỉ</Text></View>

                {description ? (
                    <View style={styles.descriptionBox}>
                        <Text style={styles.descriptionTitle}>Giới thiệu</Text>
                        <Text style={styles.descriptionText} numberOfLines={2}>{description}</Text>
                    </View>
                ) : null}

                <View style={styles.cardFooter}>
                    <Text style={styles.viewDetailText}>Xem chi tiết</Text>
                    <Icon name="arrow-forward" size={18} color="#007AFF" />
                </View>
            </View>
        </TouchableOpacity>
    );
}