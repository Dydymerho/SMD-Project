import React, { useEffect, useState } from "react";
import {
    View, Text, ScrollView, ActivityIndicator, Alert, TouchableOpacity,
    Modal, TextInput, StyleSheet, KeyboardAvoidingView, Platform
} from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Line } from 'react-native-svg';

/* --- IMPORT CÁC MODULE BACKEND --- */
import styles from "./SubjectDetailScreen.styles";

import { SubjectService } from "../../../../backend/Service/SubjectService";
import { ReportApi } from "../../../../backend/api/ReportApi";
import { CourseInteractionApi } from "../../../../backend/api/CourseInteractionApi";
import { PloControlerApi } from "../../../../backend/api/ploControlerApi";
// 1. Import thêm API Mapping mới
import { CloPloMappingApi } from "../../../../backend/api/PloCloMapping";

import { SubjectDetailData } from "../../../../backend/types/SubjectDetail";

/* --- KHAI BÁO TYPE --- */
type RouteParams = {
    SubjectDetail: {
        code: string;
        name?: string;
    }
};
type DiagramNode = {
    id: string | number;
    code: string;
    desc?: string;
    y?: number
}

/* --- COMPONENT CON --- */
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

    // State Diagram (Sơ đồ)
    const [showDiagram, setShowDiagram] = useState(false);
    const [plos, setPlos] = useState<DiagramNode[]>([]);
    const [clos, setClos] = useState<DiagramNode[]>([]);
    const [mappings, setMappings] = useState<{ from: string, to: string, level: string }[]>([]);
    const [positions, setPositions] = useState<{ [key: string]: number }>({});

    // State Report
    const [modalVisible, setModalVisible] = useState(false);
    const [customReason, setCustomReason] = useState("");
    const [selectedMaterial, setSelectedMaterial] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // 2. Gọi song song 3 API: Chi tiết môn, Danh sách PLO, và Danh sách Mapping
                const [subjectResult, ploRes, mappingRes] = await Promise.all([
                    SubjectService.getFullDetail(code),
                    PloControlerApi.getPlo(),
                    CloPloMappingApi.getAllMappings() // Gọi thêm API này
                ]);

                if (!subjectResult) {
                    Alert.alert("Thông báo", `Không tìm thấy dữ liệu cho môn: ${code}`);
                    setLoading(false);
                    return;
                }
                setData(subjectResult);

                // --- XỬ LÝ DỮ LIỆU SƠ ĐỒ (LOGIC MỚI) ---
                const listPlos = (ploRes as any).data || ploRes || [];
                const listMappings = (mappingRes as any).data || mappingRes || [];

                const relevantPlos: DiagramNode[] = [];
                const relevantClos: DiagramNode[] = [];
                const mapLinks: { from: string, to: string, level: string }[] = [];

                const seenClo = new Set<string>();
                const seenPlo = new Set<string>();

                // Chuẩn hóa mã môn hiện tại (Ví dụ: "INT3306")
                const currentCourseCode = subjectResult.info.courseCode ? subjectResult.info.courseCode.trim().toUpperCase() : "";

                // Duyệt qua danh sách Mapping phẳng để tìm liên kết
                if (Array.isArray(listMappings)) {
                    listMappings.forEach((m: any) => {
                        // Kiểm tra xem mapping này có thuộc môn học hiện tại không
                        // (Dựa vào cloCode hoặc courseCode trong mapping nếu có)
                        // Giả sử mapping có trường cloCode dạng "INT3306_CLO1" hoặc courseCode
                        const mappingCourseCode = m.courseCode ? m.courseCode.trim().toUpperCase() : "";
                        const mappingCloCode = m.cloCode ? m.cloCode.trim().toUpperCase() : "";

                        // Logic so sánh: Hoặc courseCode khớp, hoặc cloCode chứa mã môn
                        const isMatch = mappingCourseCode === currentCourseCode || mappingCloCode.includes(currentCourseCode);

                        if (isMatch) {
                            // 1. Lưu đường nối
                            mapLinks.push({
                                from: m.ploCode, // Ví dụ: PLO1
                                to: m.cloCode,   // Ví dụ: INT3306_CLO1
                                level: m.mappingLevel // I, R, E
                            });

                            // 2. Lưu CLO (nếu chưa có)
                            if (!seenClo.has(m.cloCode)) {
                                seenClo.add(m.cloCode);
                                relevantClos.push({
                                    id: m.cloId,
                                    code: m.cloCode,
                                    desc: m.cloDescription || m.cloCode
                                });
                            }

                            // 3. Tìm và lưu thông tin chi tiết PLO (nếu chưa có)
                            if (!seenPlo.has(m.ploCode)) {
                                seenPlo.add(m.ploCode);
                                // Tìm thông tin mô tả trong danh sách listPlos ban đầu
                                const ploInfo = listPlos.find((p: any) => p.ploCode === m.ploCode);
                                relevantPlos.push({
                                    id: m.ploId,
                                    code: m.ploCode,
                                    desc: ploInfo ? ploInfo.ploDescription : "Mô tả PLO"
                                });
                            }
                        }
                    });
                }

                // Sắp xếp lại cho đẹp (Optional)
                relevantPlos.sort((a, b) => a.code.localeCompare(b.code));
                relevantClos.sort((a, b) => a.code.localeCompare(b.code));

                console.log(`Tìm thấy: ${relevantPlos.length} PLOs, ${relevantClos.length} CLOs`);

                setPlos(relevantPlos);
                setClos(relevantClos);
                setMappings(mapLinks);

                // --- Xử lý Follow ---
                try {
                    const followedList = await CourseInteractionApi.getFollowedCourses();
                    if (Array.isArray(followedList)) {
                        const currentId = subjectResult.info.id || (subjectResult.info as any).syllabusId;
                        const isFound = followedList.some((item: any) => item.courseId === currentId);
                        setIsFollowed(isFound);
                    }
                } catch (followError) { console.warn("Lỗi follow:", followError); }

            } catch (error) {
                console.error("Lỗi tải trang:", error);
                Alert.alert("Lỗi", "Không thể tải dữ liệu.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [code]);

    // ... (Giữ nguyên các hàm handleFollowToggle, sendReportToApi, v.v...)
    const handleFollowToggle = async () => {
        if (!data || isUpdatingFollow) return;
        const token = await AsyncStorage.getItem('AUTH_TOKEN');
        if (!token) { Alert.alert("Yêu cầu", "Vui lòng đăng nhập."); return; }
        const courseId = data.info.id || (data.info as any).syllabusId;
        setIsUpdatingFollow(true);
        const previousStatus = isFollowed;
        setIsFollowed(!isFollowed);
        try {
            if (previousStatus) await CourseInteractionApi.unfollowCourse(courseId);
            else await CourseInteractionApi.followCourse(courseId);
        } catch (e) {
            setIsFollowed(previousStatus);
            Alert.alert("Lỗi", "Không thể cập nhật follow");
        } finally { setIsUpdatingFollow(false); }
    };

    const sendReportToApi = async (title: string, desc: string) => {
        try {
            await ReportApi.createReport({ title: `Báo lỗi: ${title}`, description: desc });
            Alert.alert("Thành công", "Đã gửi báo cáo");
        } catch (e) { Alert.alert("Lỗi", "Gửi thất bại"); }
    };
    const handleSubmitCustomReason = () => {
        if (customReason && selectedMaterial) sendReportToApi(selectedMaterial.title, customReason);
        setModalVisible(false); setCustomReason("");
    };
    const handleReport = (item: any) => {
        Alert.alert("Báo cáo", `Vấn đề với ${item.title}?`, [
            { text: "Hủy", style: "cancel" },
            { text: "Link hỏng", onPress: () => sendReportToApi(item.title, "Link 404") },
            { text: "Khác", onPress: () => { setSelectedMaterial(item); setModalVisible(true); } }
        ]);
    };

    const getColorByLevel = (level: string) => {
        switch (level) {
            case 'I': return '#3b82f6';
            case 'R': return '#eab308';
            case 'E': return '#ef4444';
            default: return '#cbd5e1';
        }
    };

    const updatePosition = (key: string, y: number, height: number) => {
        const centerY = y + height / 2;
        setPositions(prev => ({ ...prev, [key]: centerY }));
    };

    // RENDER
    if (loading) return <View style={styles.container}><ActivityIndicator size="large" color="#4F1CFF" style={{ marginTop: 50 }} /></View>;
    if (!data) return <View style={styles.container}><Text>Không có dữ liệu</Text></View>;

    const { info, plans, assessments, materials } = data;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <LinearGradient colors={["#32502a", "#20331b"]} style={styles.header}>
                    <Text style={styles.code}>{info.courseCode}</Text>
                    <Text style={styles.title}>{info.courseName}</Text>
                    <Text style={styles.subtitle}>{info.deptName}</Text>
                    <View style={{ marginTop: 15, alignItems: 'flex-start' }}>
                        <FollowButton isFollowed={isFollowed} isLoading={isUpdatingFollow} onPress={handleFollowToggle} />
                    </View>
                </LinearGradient>

                <Section title="Mô tả tóm tắt">
                    <Text style={styles.missionText}>{info.description}</Text>
                </Section>

                <Section title="Thông tin chi tiết">
                    <InfoRow label="Giảng viên" value={info.lecturerName} />
                    <InfoRow label="Tín chỉ" value={info.credit} />
                    <InfoRow label="Năm học" value={info.academicYear} />
                    <InfoRow label="Loại hình" value={info.type} />
                </Section>

                {/* --- NÚT BẤM & SƠ ĐỒ --- */}
                <View style={{ marginTop: 20 }}>
                    <TouchableOpacity
                        style={styles.toggleBtn}
                        onPress={() => setShowDiagram(!showDiagram)}
                    >
                        <Text style={styles.toggleBtnText}>
                            {showDiagram ? "Ẩn sơ đồ ánh xạ" : "Xem sơ đồ ánh xạ PLO - CLO"}
                        </Text>
                    </TouchableOpacity>

                    {showDiagram && (
                        <Section title="Sơ đồ ánh xạ (Map Chart)">
                            {(plos.length > 0 && clos.length > 0) ? (
                                <>
                                    <View style={styles.diagramContainer}>
                                        <Svg style={styles.svgLayer}>
                                            {mappings.map((m, i) => {
                                                const y1 = positions[m.from];
                                                const y2 = positions[m.to];
                                                if (y1 !== undefined && y2 !== undefined) {
                                                    return (
                                                        <Line key={i} x1="25%" y1={y1} x2="75%" y2={y2}
                                                            stroke={getColorByLevel(m.level)} strokeWidth="2" strokeOpacity={0.6} />
                                                    );
                                                }
                                                return null;
                                            })}
                                        </Svg>
                                        <View style={styles.column}>
                                            <Text style={styles.colTitle}>Program (PLO)</Text>
                                            {plos.map(p => (
                                                <View key={p.code} style={[styles.node, styles.ploNode]}
                                                    onLayout={(e) => updatePosition(p.code, e.nativeEvent.layout.y, e.nativeEvent.layout.height)}>
                                                    <Text style={styles.nodeTitle}>{p.code}</Text>
                                                    <Text style={styles.nodeDesc} numberOfLines={2}>{p.desc}</Text>
                                                </View>
                                            ))}
                                        </View>
                                        <View style={styles.column}>
                                            <Text style={styles.colTitle}>Course (CLO)</Text>
                                            {clos.map(c => (
                                                <View key={c.code} style={[styles.node, styles.cloNode]}
                                                    onLayout={(e) => updatePosition(c.code, e.nativeEvent.layout.y, e.nativeEvent.layout.height)}>
                                                    <Text style={styles.nodeTitle}>{c.code}</Text>
                                                    <Text style={styles.nodeDesc}>{info.courseCode}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 10 }}>
                                        <Text style={{ fontSize: 10, color: '#3b82f6' }}>● Introduced</Text>
                                        <Text style={{ fontSize: 10, color: '#eab308' }}>● Reinforced</Text>
                                        <Text style={{ fontSize: 10, color: '#ef4444' }}>● Emphasized</Text>
                                    </View>
                                </>
                            ) : (
                                <View style={{ padding: 20, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 40, marginBottom: 10 }}>📭</Text>
                                    <Text style={{ fontSize: 14, color: '#64748b', fontStyle: 'italic', textAlign: 'center' }}>
                                        Chưa có dữ liệu ánh xạ (Mapping) cho môn học này.
                                    </Text>
                                </View>
                            )}
                        </Section>
                    )}
                </View>

                {plans.length > 0 && (
                    <Section title="Kế hoạch giảng dạy">
                        {plans.sort((a, b) => a.weekNo - b.weekNo).map((item, index) => (
                            <View key={index} style={styles.teachingPlanRow}>
                                <Text style={styles.week}>Tuần {item.weekNo}</Text>
                                <Text style={styles.topic}>{item.topic}</Text>
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
                {materials.length > 0 && (
                    <Section title="Tài liệu tham khảo">
                        {materials.map((item, index) => (
                            <View key={index} style={{ marginBottom: 15 }}>
                                <Text style={styles.bullet}>[{index + 1}] {item.title}</Text>
                                <TouchableOpacity onPress={() => handleReport(item)} style={styles.reportBtn}>
                                    <Text style={styles.reportText}>Báo lỗi</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </Section>
                )}
            </ScrollView>

            <Modal transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Nhập lý do báo cáo</Text>
                        <TextInput style={styles.input} multiline value={customReason} onChangeText={setCustomReason} />
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