import React, { useEffect, useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native"
import { type RouteProp, useRoute, useNavigation } from "@react-navigation/native"
import LinearGradient from "react-native-linear-gradient"
import styles from "./SubjectDetailScreen.styles"

// --- 1. SỬA ĐƯỜNG DẪN IMPORT (Tùy cấu trúc thư mục thực tế của bạn) ---
import { syllabusDetailApi } from "../../../../backend/api/DetailSyllabusApi"
import { SessionPlanApi } from "../../../../backend/api/SesssionPlanApi" // Đảm bảo tên file đúng
import { AssessmentApi } from "../../../../backend/api/AssessmentApi"
import { MaterialApi } from "../../../../backend/api/MateriaApi" // Đảm bảo tên file đúng

import { syllabus } from "../../../../backend/types/syllabusDetail"
import { SessionPlan } from "../../../../backend/types/SessionPlan"
import { Assessment } from "../../../../backend/types/Assessment"
import { Material } from "../../../../backend/types/Material"

/* ===== TYPES ===== */
type RouteParams = {
    SubjectDetail: {
        code: string
        name?: string
    }
}

/* ===== COMPONENTS CON ===== */
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
    </View>
)

const InfoRow = ({ label, value }: { label: string; value?: string | number }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || "—"}</Text>
    </View>
)

/* ===== SCREEN CHÍNH ===== */
export default function SubjectDetailScreen() {
    const route = useRoute<RouteProp<RouteParams, "SubjectDetail">>()
    const navigation = useNavigation();
    const { code } = route.params

    // --- STATE MANAGEMENT ---
    const [loading, setLoading] = useState<boolean>(true);
    const [syllabusData, setSyllabusData] = useState<syllabus | null>(null);
    const [sessionPlans, setSessionPlans] = useState<SessionPlan[]>([]);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);

                // 1. GỌI SONG SONG TẤT CẢ API (Tối ưu tốc độ)
                // Promise.all sẽ chờ cho đến khi tất cả xong hoặc 1 cái bị lỗi
                const [
                    syllabusRes,
                    sessionPlanRes,
                    assessmentRes,
                    materialRes
                ] = await Promise.all([
                    syllabusDetailApi.getSyllabusDetail(), // Index 0
                    SessionPlanApi.getSessionPlan(),       // Index 1
                    AssessmentApi.getAssessment(),         // Index 2
                    MaterialApi.getMaterial()              // Index 3
                ]);

                // 2. XỬ LÝ SYLLABUS (Tìm môn học hiện tại)
                const currentSyllabus = syllabusRes.data.find(
                    s => s.courseCode === code
                );

                if (currentSyllabus) {
                    setSyllabusData(currentSyllabus);

                    // Giả sử Syllabus có trường id. Nếu không có id, bạn cần check lại logic kết nối.
                    const syllabusId = currentSyllabus.id;

                    if (syllabusId) {
                        // 3. LỌC DỮ LIỆU CON THEO SYLLABUS ID
                        const myPlans = sessionPlanRes.data.filter(
                            p => p.syllabusId === syllabusId
                        );

                        const myAssessments = assessmentRes.data.filter(
                            a => a.syllabusId === syllabusId
                        );

                        const myMaterials = materialRes.data.filter(
                            m => m.syllabusId === syllabusId
                        );

                        // 4. CẬP NHẬT STATE
                        setSessionPlans(myPlans);
                        setAssessments(myAssessments);
                        setMaterials(myMaterials);
                    } else {
                        console.warn("Syllabus tìm thấy nhưng không có ID để link dữ liệu");
                    }
                } else {
                    console.log("Không tìm thấy Syllabus với mã:", code);
                    // Có thể set state để hiển thị UI thông báo lỗi
                }

            } catch (error) {
                console.error("Lỗi tải dữ liệu:", error);
                Alert.alert("Lỗi", "Không thể tải dữ liệu. Vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [code]);

    // --- RENDER LOADING ---
    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#4F1CFF" />
                <Text style={{ marginTop: 10, color: '#666' }}>Đang tải dữ liệu {code}...</Text>
            </View>
        );
    }

    // --- RENDER ERROR / NOT FOUND ---
    if (!syllabusData) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
                <Text style={{ fontSize: 16, color: '#333', textAlign: 'center' }}>
                    Không tìm thấy thông tin cho mã môn học: {code}
                </Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.reportBtn}>
                    <Text style={styles.reportText}>Quay lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // --- RENDER CONTENT ---
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* 1. HEADER */}
            <LinearGradient
                colors={["#4F1CFF", "#2D5BFF"]}
                style={styles.header}>
                <Text style={styles.code}>{syllabusData.courseCode}</Text>
                <Text style={styles.title}>{syllabusData.courseName}</Text>
                <Text style={styles.subtitle}>{syllabusData.deptName || "Bộ môn: Đang cập nhật"}</Text>
            </LinearGradient>

            {/* 2. MÔ TẢ */}
            <Section title="Mô tả tóm tắt (AI Summary)">
                <Text style={styles.missionText}>
                    {syllabusData.aiSumary || "Hiện chưa có mô tả tóm tắt cho môn học này."}
                </Text>
            </Section>

            {/* 3. THÔNG TIN CHUNG */}
            <Section title="Thông tin khóa học">
                <InfoRow label="Giảng viên" value={syllabusData.lecturerName} />
                <InfoRow label="Bộ môn" value={syllabusData.deptName} />
                <InfoRow label="Tín chỉ" value={syllabusData.credit} />
                <InfoRow label="Năm học" value={syllabusData.academicYear} />
                <InfoRow label="Loại hình" value={syllabusData.type || "Chính quy"} />
            </Section>

            {/* 4. MỤC TIÊU HỌC PHẦN (Optional) */}
            {syllabusData.target && syllabusData.target.length > 0 && (
                <Section title="Mục tiêu học phần">
                    {syllabusData.target.map((item, index) => (
                        <View key={`target-${index}`} style={styles.outcomeItem}>
                            <View style={styles.outcomeBadge}>
                                <Text style={styles.outcomeBadgeText}>CO {index + 1}</Text>
                            </View>
                            <Text style={styles.outcomeText}>{item}</Text>
                        </View>
                    ))}
                </Section>
            )}

            {/* 5. KẾ HOẠCH GIẢNG DẠY (SESSION PLAN) */}
            {sessionPlans.length > 0 ? (
                <Section title="Kế hoạch giảng dạy">
                    {sessionPlans
                        .sort((a, b) => a.weekNo - b.weekNo) // Sắp xếp theo tuần
                        .map((item, index) => (
                            <View key={item.sessionId || index} style={styles.teachingPlanRow}>
                                <Text style={styles.week}>Tuần {item.weekNo}</Text>
                                <Text style={styles.topic}>{item.topic}</Text>
                                <Text style={styles.method}>Phương pháp: {item.teachingMethod}</Text>
                            </View>
                        ))}
                </Section>
            ) : null}

            {/* 6. ĐÁNH GIÁ (ASSESSMENT) */}
            {assessments.length > 0 ? (
                <Section title="Phương thức đánh giá">
                    {assessments.map((item, index) => (
                        <Text key={item.assessmentId || index} style={styles.bullet}>
                            • {item.name}: <Text style={{ fontWeight: 'bold' }}>{item.weightPercent}%</Text>
                            {item.criteria ? ` - ${item.criteria}` : ''}
                        </Text>
                    ))}
                </Section>
            ) : null}

            {/* 7. TÀI LIỆU (MATERIALS) */}
            {materials.length > 0 ? (
                <Section title="Tài liệu học tập">
                    {materials.map((item, index) => (
                        <View key={item.materialId || index} style={{ marginBottom: 12 }}>
                            <Text style={styles.bullet}>
                                {`[${index + 1}]`} <Text style={{ fontWeight: '600', color: '#0F172A' }}>{item.title}</Text>
                            </Text>
                            <Text style={[styles.subtitle, { color: '#64748B', marginLeft: 16, marginTop: -4 }]}>
                                Tác giả: {item.author} • {item.materialType}
                            </Text>
                        </View>
                    ))}
                </Section>
            ) : null}

            {/* FOOTER BUTTON */}
            <TouchableOpacity style={styles.reportBtn} onPress={() => Alert.alert("Thông báo", "Đã gửi báo cáo thành công!")}>
                <Text style={styles.reportText}>Báo cáo sai sót dữ liệu</Text>
            </TouchableOpacity>

        </ScrollView>
    )
}