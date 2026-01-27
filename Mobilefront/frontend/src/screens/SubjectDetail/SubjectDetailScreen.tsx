import React, { useEffect, useState } from "react";
import {
    View, Text, ScrollView, ActivityIndicator, Alert, TouchableOpacity,
    Modal, TextInput, StyleSheet, KeyboardAvoidingView, Platform
} from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import AsyncStorage from '@react-native-async-storage/async-storage';

/* --- IMPORT CÁC MODULE BACKEND --- */
// Import Style
import styles from "./SubjectDetailScreen.styles";

// Import Service & API
import { SubjectService } from "../../../../backend/Service/SubjectService";
import { ReportApi } from "../../../../backend/api/ReportApi";
import { CourseInteractionApi } from "../../../../backend/api/CourseInteractionApi"; // API Follow mới tách

// Import Types
import { SubjectDetailData } from "../../../../backend/types/SubjectDetail";

/* --- KHAI BÁO TYPE --- */
type RouteParams = {
    SubjectDetail: {
        code: string;
        name?: string;
    }
};

/* --- COMPONENT CON: SECTION & INFO ROW --- */
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
    </View>
);

const InfoRow = ({ label, value }: { label: string; value?: string | number }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || "—"}</Text>
    </View>
);

/* --- COMPONENT CON: NÚT FOLLOW --- */
const FollowButton = ({ isFollowed, isLoading, onPress }: { isFollowed: boolean, isLoading: boolean, onPress: () => void }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isLoading}
            style={[
                styles.followBtn,
                isFollowed ? styles.followBtnActive : styles.followBtnInactive,
                isLoading && { opacity: 0.7 }
            ]}
        >
            {isLoading ? (
                <ActivityIndicator size="small" color={isFollowed ? "#666" : "#FFF"} />
            ) : (
                <Text style={[
                    styles.followBtnText,
                    isFollowed ? styles.followTextActive : styles.followTextInactive
                ]}>
                    {isFollowed ? "Đang theo dõi" : "+ Theo dõi"}
                </Text>
            )}
        </TouchableOpacity>
    );
};

/* --- MÀN HÌNH CHÍNH --- */
export default function SubjectDetailScreen() {
    const route = useRoute<RouteProp<RouteParams, "SubjectDetail">>();
    const navigation = useNavigation();
    const { code } = route.params;

    // State dữ liệu
    const [data, setData] = useState<SubjectDetailData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // State Follow 
    const [isFollowed, setIsFollowed] = useState(false);
    const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);

    // report
    const [modalVisible, setModalVisible] = useState(false);
    const [customReason, setCustomReason] = useState("");
    const [selectedMaterial, setSelectedMaterial] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // A. Gọi API lấy chi tiết môn học trước (Quan trọng nhất)
                const subjectResult = await SubjectService.getFullDetail(code);

                if (!subjectResult) {
                    Alert.alert("Thông báo", `Không tìm thấy dữ liệu cho môn: ${code}`);
                    setLoading(false);
                    return;
                }


                setData(subjectResult);


                try {
                    const followedList = await CourseInteractionApi.getFollowedCourses();

                    if (Array.isArray(followedList)) {
                        const currentId = subjectResult.info.id || (subjectResult.info as any).syllabusId;
                        const currentCode = subjectResult.info.courseCode;

                        const isFound = followedList.some((item: any) =>
                            (item.courseId && item.courseId === currentId) ||
                            (item.courseCode && item.courseCode === currentCode)
                        );
                        setIsFollowed(isFound);
                    }
                } catch (followError) {
                    console.warn("Lỗi lấy danh sách follow:", followError);
                }

            } catch (error) {
                console.error("Lỗi tải trang:", error);
                Alert.alert("Lỗi", "Không thể tải dữ liệu môn học.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [code]);

    const handleFollowToggle = async () => {
        if (!data || isUpdatingFollow) return;

        const token = await AsyncStorage.getItem('AUTH_TOKEN');
        if (!token) {
            Alert.alert("Yêu cầu", "Vui lòng đăng nhập để sử dụng tính năng này.");
            return;
        }

        const courseId = data.info.id || (data.info as any).syllabusId;
        if (!courseId) {
            Alert.alert("Lỗi", "Không xác định được ID khóa học.");
            return;
        }

        const previousStatus = isFollowed;
        setIsFollowed(!previousStatus);
        setIsUpdatingFollow(true);

        try {
            if (previousStatus) {
                await CourseInteractionApi.unfollowCourse(courseId);
            } else {
                await CourseInteractionApi.followCourse(courseId);
            }
        } catch (error) {
            console.error("Lỗi Toggle Follow:", error);
            setIsFollowed(previousStatus);
            Alert.alert("Thất bại", "Không thể cập nhật trạng thái theo dõi.");
        } finally {
            setIsUpdatingFollow(false);
        }
    };

    // --- 3. XỬ LÝ REPORT 
    const sendReportToApi = async (materialTitle: string, reason: string) => {
        try {
            const payload = {
                title: `Báo lỗi tài liệu: ${materialTitle}`,
                description: reason
            };
            await ReportApi.createReport(payload);
            Alert.alert("Đã gửi", "Cảm ơn đóng góp của bạn!");
        } catch (error) {
            console.error("Lỗi report:", error);
            Alert.alert("Lỗi", "Gửi báo cáo thất bại.");
        }
    };

    const handleSubmitCustomReason = () => {
        if (!customReason.trim()) return;
        if (selectedMaterial) sendReportToApi(selectedMaterial.title, customReason);
        setCustomReason("");
        setModalVisible(false);
    };

    const handleReport = (item: any) => {
        Alert.alert(
            "Báo cáo tài liệu",
            `Vấn đề với "${item.title}"?`,
            [
                { text: "Hủy", style: "cancel" },
                { text: "Link hỏng", onPress: () => sendReportToApi(item.title, "Link hỏng / 404") },
                { text: "Khác", onPress: () => { setSelectedMaterial(item); setModalVisible(true); } }
            ]
        );
    };

    // --- 4. RENDER GIAO DIỆN ---
    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#4F1CFF" />
            </View>
        );
    }

    if (!data) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text>Không có dữ liệu</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 10 }}>
                    <Text style={{ color: 'blue' }}>Quay lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const { info, plans, assessments, materials } = data;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.contentContainer}>

                {/* A. HEADER GRADIENT & INFO */}
                <LinearGradient colors={["#4F1CFF", "#2D5BFF"]} style={styles.header}>
                    <Text style={styles.code}>{info.courseCode}</Text>
                    <Text style={styles.title}>{info.courseName}</Text>
                    <Text style={styles.subtitle}>{info.deptName}</Text>

                    {/* Nút Follow đặt ở đây */}
                    <View style={{ marginTop: 15, alignItems: 'flex-start' }}>
                        <FollowButton
                            isFollowed={isFollowed}
                            isLoading={isUpdatingFollow}
                            onPress={handleFollowToggle}
                        />
                    </View>
                </LinearGradient>

                {/* B. CÁC SECTION NỘI DUNG */}
                <Section title="Mô tả tóm tắt">
                    <Text style={styles.missionText}>{info.aiSumary}</Text>
                </Section>

                <Section title="Thông tin chi tiết">
                    <InfoRow label="Giảng viên" value={info.lecturerName} />
                    <InfoRow label="Tín chỉ" value={info.credit} />
                    <InfoRow label="Năm học" value={info.academicYear} />
                    <InfoRow label="Loại hình" value={info.type} />
                </Section>

                {/* Mục tiêu */}
                {info.target && info.target.length > 0 && (
                    <Section title="Mục tiêu học phần">
                        {info.target.map((t, index) => (
                            <View key={index} style={styles.outcomeItem}>
                                <View style={styles.outcomeBadge}>
                                    <Text style={styles.outcomeBadgeText}>CO {index + 1}</Text>
                                </View>
                                <Text style={styles.outcomeText}>{t}</Text>
                            </View>
                        ))}
                    </Section>
                )}

                {/* Chuẩn đầu ra */}
                {info.clos && info.clos.length > 0 && (
                    <Section title="Chuẩn đầu ra (CLOs)">
                        {info.clos.map((c, index) => (
                            <Text key={index} style={styles.bullet}>• {c}</Text>
                        ))}
                    </Section>
                )}

                {/* Kế hoạch giảng dạy */}
                {plans.length > 0 && (
                    <Section title="Kế hoạch giảng dạy">
                        {plans.sort((a, b) => a.weekNo - b.weekNo).map((item, index) => (
                            <View key={index} style={styles.teachingPlanRow}>
                                <Text style={styles.week}>Tuần {item.weekNo}</Text>
                                <Text style={styles.topic}>{item.topic}</Text>
                                <Text style={styles.method}>PP: {item.teachingMethod}</Text>
                            </View>
                        ))}
                    </Section>
                )}

                {/* Đánh giá */}
                {assessments.length > 0 && (
                    <Section title="Đánh giá & Điểm số">
                        {assessments.map((item, index) => (
                            <Text key={index} style={styles.bullet}>
                                • {item.name}: <Text style={{ fontWeight: 'bold' }}>{item.weightPercent}%</Text>
                                {item.criteria ? ` (${item.criteria})` : ''}
                            </Text>
                        ))}
                    </Section>
                )}

                {/* Tài liệu tham khảo */}
                {materials.length > 0 && (
                    <Section title="Tài liệu tham khảo">
                        {materials.map((item, index) => (
                            <View key={index} style={{ marginBottom: 15 }}>
                                <Text style={styles.bullet}>
                                    [{index + 1}] <Text style={{ fontWeight: '600' }}>{item.title}</Text>
                                </Text>
                                <Text style={[styles.subtitle, { color: '#666', marginLeft: 15, fontSize: 13 }]}>
                                    {item.author} ({item.materialType})
                                </Text>
                                <TouchableOpacity onPress={() => handleReport(item)} style={styles.reportBtn}>
                                    <Text style={styles.reportText}>Báo lỗi</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </Section>
                )}
            </ScrollView>

            {/* C. MODAL BÁO CÁO */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Nhập lý do báo cáo</Text>
                        <Text style={styles.modalSubtitle}>Tài liệu: {selectedMaterial?.title}</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Mô tả chi tiết vấn đề..."
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={4}
                            value={customReason}
                            onChangeText={setCustomReason}
                        />

                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={[styles.button, styles.buttonCancel]} onPress={() => setModalVisible(false)}>
                                <Text style={styles.textCancel}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, styles.buttonConfirm]} onPress={handleSubmitCustomReason}>
                                <Text style={styles.textConfirm}>Gửi</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

