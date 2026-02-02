import React, { useEffect, useState } from "react";
import {
    View, Text, ScrollView, ActivityIndicator, Alert, TouchableOpacity,
    Modal, TextInput, KeyboardAvoidingView, Platform
} from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Line } from 'react-native-svg';
// Nếu chưa cài icon, bạn có thể comment dòng này và xóa các thẻ <Icon /> bên dưới
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

/* --- IMPORT CUSTOM --- */
import styles from "./SubjectDetailScreen.styles";
import { SubjectService } from "../../../../backend/Service/SubjectService";
import { ReportApi } from "../../../../backend/api/ReportApi";
import { CourseInteractionApi } from "../../../../backend/api/CourseInteractionApi";
import { PloControlerApi } from "../../../../backend/api/ploControlerApi";
import { CloPloMappingApi } from "../../../../backend/api/PloCloMapping";
import { SubjectDetailData } from "../../../../backend/types/SubjectDetail";

/* --- TYPES --- */
type RouteParams = {
    SubjectDetail: { code: string; name?: string; }
};
type DiagramNode = {
    id: string | number;
    code: string;
    desc?: string;
    y?: number
}

/* --- COMPONENTS CON --- */
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
    </View>
);

const InfoRow = ({ label, value, icon }: { label: string; value?: string | number, icon?: string }) => (
    <View style={styles.infoRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {icon && <Icon name={icon} size={18} color="#94A3B8" style={{ marginRight: 8 }} />}
            <Text style={styles.infoLabel}>{label}</Text>
        </View>
        <Text style={styles.infoValue}>{value || "—"}</Text>
    </View>
);

const FollowButton = ({ isFollowed, isLoading, onPress }: { isFollowed: boolean, isLoading: boolean, onPress: () => void }) => (
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
            <ActivityIndicator size="small" color={isFollowed ? "#15803d" : "#FFF"} />
        ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name={isFollowed ? "check-circle" : "plus-circle"} size={16} color={isFollowed ? "#15803d" : "#FFF"} style={{ marginRight: 6 }} />
                <Text style={[styles.followBtnText, isFollowed ? styles.followTextActive : styles.followTextInactive]}>
                    {isFollowed ? "Đã theo dõi" : "Theo dõi"}
                </Text>
            </View>
        )}
    </TouchableOpacity>
);

/* --- MAIN SCREEN --- */
export default function SubjectDetailScreen() {
    const route = useRoute<RouteProp<RouteParams, "SubjectDetail">>();
    const navigation = useNavigation();
    const { code } = route.params;

    // State Data
    const [data, setData] = useState<SubjectDetailData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // State Logic
    const [isFollowed, setIsFollowed] = useState(false);
    const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);

    // State Diagram
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
                // 1. Gọi song song 3 API
                const [subjectResult, ploRes, mappingRes] = await Promise.all([
                    SubjectService.getFullDetail(code),
                    PloControlerApi.getPlo(),
                    CloPloMappingApi.getAllMappings().catch(() => [])
                ]);

                if (!subjectResult) {
                    Alert.alert("Thông báo", `Không tìm thấy dữ liệu: ${code}`);
                    navigation.goBack();
                    return;
                }
                setData(subjectResult);

                // 2. Logic xử lý Sơ đồ (Lọc theo mã môn/ID)
                const listPlos = (ploRes as any).data || ploRes || [];
                const listMappings = (mappingRes as any).data || mappingRes || [];

                const relevantPlos: DiagramNode[] = [];
                const relevantClos: DiagramNode[] = [];
                const mapLinks: { from: string, to: string, level: string }[] = [];
                const seenClo = new Set<string>();
                const seenPlo = new Set<string>();

                const currentCourseCode = subjectResult.info.courseCode ? subjectResult.info.courseCode.trim().toUpperCase() : "";
                const currentSyllabusId = (subjectResult.info as any).syllabusId || (subjectResult.info as any).id;

                if (Array.isArray(listMappings)) {
                    listMappings.forEach((m: any) => {
                        const mapSyllabusId = m.syllabusId;
                        const mapCourseCode = m.courseCode ? m.courseCode.trim().toUpperCase() : "";
                        const mapCloCode = m.cloCode ? m.cloCode.trim().toUpperCase() : "";

                        let isMatch = false;
                        if (currentSyllabusId && mapSyllabusId && mapSyllabusId === currentSyllabusId) {
                            isMatch = true;
                        } else if (mapCourseCode === currentCourseCode) {
                            isMatch = true;
                        } else if (mapCloCode.includes(currentCourseCode)) {
                            isMatch = true;
                        }

                        if (isMatch) {
                            mapLinks.push({ from: m.ploCode, to: m.cloCode, level: m.mappingLevel });
                            if (!seenClo.has(m.cloCode)) {
                                seenClo.add(m.cloCode);
                                relevantClos.push({ id: m.cloId || m.cloCode, code: m.cloCode, desc: m.cloDescription || m.cloCode });
                            }
                            if (!seenPlo.has(m.ploCode)) {
                                seenPlo.add(m.ploCode);
                                const ploInfo = listPlos.find((p: any) => p.ploCode === m.ploCode);
                                relevantPlos.push({ id: m.ploId || m.ploCode, code: m.ploCode, desc: ploInfo ? ploInfo.ploDescription : "Mô tả PLO" });
                            }
                        }
                    });
                }

                // Sort Alpha
                relevantPlos.sort((a, b) => a.code.localeCompare(b.code));
                relevantClos.sort((a, b) => a.code.localeCompare(b.code));

                setPlos(relevantPlos);
                setClos(relevantClos);
                setMappings(mapLinks);

                // 3. Check Follow
                try {
                    const followedList = await CourseInteractionApi.getFollowedCourses();
                    if (Array.isArray(followedList)) {
                        const currentId = subjectResult.info.id || (subjectResult.info as any).syllabusId;
                        const isFound = followedList.some((item: any) => item.courseId === currentId);
                        setIsFollowed(isFound);
                    }
                } catch (e) { }

            } catch (error) {
                console.error(error);
                Alert.alert("Lỗi", "Không thể tải dữ liệu.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [code]);

    // --- HANDLERS ---
    const handleFollowToggle = async () => {
        if (!data || isUpdatingFollow) return;
        const token = await AsyncStorage.getItem('AUTH_TOKEN');
        if (!token) { Alert.alert("Yêu cầu", "Vui lòng đăng nhập."); return; }

        const courseId = data.info.id || (data.info as any).syllabusId;
        setIsUpdatingFollow(true);
        const prev = isFollowed;
        setIsFollowed(!prev);
        try {
            if (prev) await CourseInteractionApi.unfollowCourse(courseId);
            else await CourseInteractionApi.followCourse(courseId);
        } catch (e) {
            setIsFollowed(prev);
            Alert.alert("Lỗi", "Cập nhật thất bại");
        } finally { setIsUpdatingFollow(false); }
    };

    const sendReportToApi = async (materialTitle: string, reason: string) => {
        try {
            await ReportApi.createReport({ title: `Báo lỗi: ${materialTitle}`, description: reason });
            Alert.alert("Thành công", "Đã gửi báo cáo");
        } catch { Alert.alert("Lỗi", "Gửi thất bại"); }
    };
    const handleSubmitCustomReason = () => {
        if (customReason && selectedMaterial) sendReportToApi(selectedMaterial.title, customReason);
        setModalVisible(false); setCustomReason("");
    };
    const handleReport = (item: any) => {
        Alert.alert("Báo cáo", `Vấn đề với "${item.title}"?`, [
            { text: "Hủy", style: "cancel" },
            { text: "Link hỏng", onPress: () => sendReportToApi(item.title, "Link 404") },
            { text: "Khác", onPress: () => { setSelectedMaterial(item); setModalVisible(true); } }
        ]);
    };

    const updatePosition = (key: string, y: number, height: number) => {
        setPositions(prev => ({ ...prev, [key]: y + height / 2 }));
    };

    const getColorByLevel = (level: string) => {
        switch (level) {
            case 'I': return '#3b82f6';
            case 'R': return '#eab308';
            case 'E': return '#ef4444';
            default: return '#cbd5e1';
        }
    };

    // --- RENDER ---
    if (loading) return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color="#15803d" /></View>;
    if (!data) return <View style={styles.container}><Text>Không có dữ liệu</Text></View>;

    const { info, plans, assessments, materials } = data;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>

                {/* 1. HEADER GRADIENT */}
                <LinearGradient colors={["#32502a", "#20331b"]} style={styles.header}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ flex: 1, paddingRight: 10 }}>
                            <Text style={styles.code}>{info.courseCode}</Text>
                            <Text style={styles.title}>{info.courseName}</Text>
                            <Text style={styles.subtitle}>{info.deptName}</Text>
                        </View>
                        <Icon name="book-education-outline" size={60} color="rgba(255,255,255,0.1)" />
                    </View>
                    <FollowButton isFollowed={isFollowed} isLoading={isUpdatingFollow} onPress={handleFollowToggle} />
                </LinearGradient>

                {/* 2. MÔ TẢ */}
                <Section title="Mô tả tóm tắt">
                    <Text style={styles.missionText}>{info.description}</Text>
                </Section>

                {/* 3. THÔNG TIN CHI TIẾT */}
                <Section title="Thông tin chi tiết">
                    <InfoRow label="Giảng viên" value={info.lecturerName} icon="account-tie" />
                    <InfoRow label="Tín chỉ" value={info.credit} icon="star-circle-outline" />
                    <InfoRow label="Năm học" value={info.academicYear} icon="calendar-range" />
                    <InfoRow label="Loại hình" value={info.type} icon="shape-outline" />
                </Section>

                {/* 4. SƠ ĐỒ ÁNH XẠ (Nút bấm xem) */}
                <View style={{ marginTop: 10, marginHorizontal: 16 }}>
                    <TouchableOpacity style={styles.toggleBtn} onPress={() => setShowDiagram(!showDiagram)}>
                        <Icon name={showDiagram ? "chevron-up" : "chevron-down"} size={20} color="#0284C7" />
                        <Text style={styles.toggleBtnText}>
                            {showDiagram ? "Thu gọn sơ đồ PLO - CLO" : "Xem sơ đồ ánh xạ PLO - CLO"}
                        </Text>
                    </TouchableOpacity>

                    {showDiagram && (
                        <View style={[styles.section, { marginHorizontal: 0, marginTop: 16 }]}>
                            <Text style={styles.sectionTitle}>Sơ đồ ánh xạ (Map Chart)</Text>
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
                                        <Text style={{ fontSize: 10, color: '#3b82f6', fontWeight: '600' }}>● Introduced</Text>
                                        <Text style={{ fontSize: 10, color: '#eab308', fontWeight: '600' }}>● Reinforced</Text>
                                        <Text style={{ fontSize: 10, color: '#ef4444', fontWeight: '600' }}>● Emphasized</Text>
                                    </View>
                                </>
                            ) : (
                                <View style={{ padding: 20, alignItems: 'center' }}>
                                    <Icon name="email-open-outline" size={40} color="#CBD5E1" />
                                    <Text style={{ marginTop: 8, color: '#64748B', fontStyle: 'italic' }}>Chưa có dữ liệu mapping</Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>

                {/* 5. KẾ HOẠCH GIẢNG DẠY (Dạng Timeline) */}
                {plans.length > 0 && (
                    <Section title="Kế hoạch giảng dạy">
                        {plans.sort((a, b) => a.weekNo - b.weekNo).map((item, index) => (
                            <View key={index} style={styles.timelineItem}>
                                <View style={styles.timelineLeft}>
                                    <View style={styles.timelineDot}>
                                        <Text style={styles.weekNum}>{item.weekNo}</Text>
                                    </View>
                                    {index < plans.length - 1 && <View style={styles.timelineLine} />}
                                </View>
                                <View style={styles.timelineContent}>
                                    <Text style={styles.topic}>{item.topic}</Text>
                                    <Text style={styles.method}>PP: {item.teachingMethod}</Text>
                                </View>
                            </View>
                        ))}
                    </Section>
                )}

                {/* 6. ĐÁNH GIÁ & ĐIỂM SỐ (Đã giữ lại) */}
                {assessments.length > 0 && (
                    <Section title="Đánh giá & Điểm số">
                        {assessments.map((item, index) => (
                            <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                    <Icon name="clipboard-check-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
                                    <Text style={{ color: '#334155', fontWeight: '600', fontSize: 14 }}>{item.name}</Text>
                                </View>
                                <View style={{ backgroundColor: '#DBEAFE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                                    <Text style={{ fontWeight: '800', color: '#2563EB', fontSize: 14 }}>{item.weightPercent}%</Text>
                                </View>
                            </View>
                        ))}
                    </Section>
                )}

                {/* 7. TÀI LIỆU THAM KHẢO */}
                {materials.length > 0 && (
                    <Section title="Tài liệu tham khảo">
                        {materials.map((item, index) => (
                            <View key={index} style={styles.bulletItem}>
                                <Text style={styles.bulletIndex}>{index + 1}</Text>
                                <View style={styles.bulletContent}>
                                    <Text style={styles.bulletTitle}>{item.title}</Text>
                                    <Text style={styles.bulletSubtitle}>{item.author} ({item.materialType})</Text>
                                    <TouchableOpacity onPress={() => handleReport(item)} style={styles.reportBtn}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Icon name="flag-outline" size={14} color="#EF4444" style={{ marginRight: 4 }} />
                                            <Text style={styles.reportText}>Báo lỗi</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </Section>
                )}

            </ScrollView>

            {/* MODAL REPORT */}
            <Modal transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)} animationType="fade">
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
                    <View style={styles.modalView}>
                        <Icon name="alert-circle-outline" size={48} color="#EF4444" style={{ alignSelf: 'center', marginBottom: 10 }} />
                        <Text style={styles.modalTitle}>Báo cáo tài liệu</Text>
                        <Text style={styles.modalSubtitle}>{selectedMaterial?.title}</Text>
                        <TextInput style={styles.input} placeholder="Mô tả chi tiết vấn đề..." placeholderTextColor="#94A3B8" multiline value={customReason} onChangeText={setCustomReason} />
                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={[styles.button, styles.buttonCancel]} onPress={() => setModalVisible(false)}>
                                <Text style={styles.textCancel}>Hủy bỏ</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, styles.buttonConfirm]} onPress={handleSubmitCustomReason}>
                                <Text style={styles.textConfirm}>Gửi báo cáo</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}