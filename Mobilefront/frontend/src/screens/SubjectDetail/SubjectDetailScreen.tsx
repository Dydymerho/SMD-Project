import React, { useEffect, useState } from "react";
import {
    View, Text, ScrollView, ActivityIndicator, Alert, TouchableOpacity,
    Modal, TextInput, KeyboardAvoidingView, Platform
} from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Line } from 'react-native-svg';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

/* --- IMPORT CUSTOM --- */
import styles from "./SubjectDetailScreen.styles";
import { SubjectService } from "../../../../backend/Service/SubjectService";
import { ReportApi } from "../../../../backend/api/ReportApi";
import { CourseInteractionApi } from "../../../../backend/api/CourseInteractionApi";
import { CourseRelationApi } from "../../../../backend/api/CourseRelationshipApi";
import { CourseNode } from "../../../../backend/types/CourseRelationShip";
import { SubjectDetailData } from "../../../../backend/types/SubjectDetail";
import { SyllabusApi } from "../../../../backend/api/SyllabusApi"; // Giữ lại API Download

/* --- TYPES --- */
type RouteParams = {
    SubjectDetail: { code: string; name?: string; }
};
type DiagramNode = {
    id: string;
    code: string;
    desc?: string;
    y?: number;
    type?: 'PREREQUISITE' | 'COREQUISITE' | 'EQUIVALENT';
    level?: number;
};
const MAX_ITEMS_PER_TYPE = 4;
type Link = { from: string; to: string; level: string; };

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

// Component Nút Theo Dõi
const FollowButton = ({ isFollowed, isLoading, onPress, style }: any) => (
    <TouchableOpacity
        onPress={onPress}
        disabled={isLoading}
        style={[
            styles.followBtn,
            isFollowed ? styles.followBtnActive : styles.followBtnInactive,
            isLoading && { opacity: 0.7 },
            style
        ]}
    >
        {isLoading ? (
            <ActivityIndicator size="small" color={isFollowed ? "#15803d" : "#FFF"} />
        ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={isFollowed ? "check-circle" : "plus-circle"} size={16} color={isFollowed ? "#15803d" : "#FFF"} style={{ marginRight: 6 }} />
                <Text style={[styles.followBtnText, isFollowed ? styles.followTextActive : styles.followTextInactive]}>
                    {isFollowed ? "Đã theo dõi" : "Theo dõi"}
                </Text>
            </View>
        )}
    </TouchableOpacity>
);

// Component Nút AI Summary (Thiết kế mới)
const AiSummaryButton = ({ isLoading, onPress, style }: any) => (
    <TouchableOpacity
        onPress={onPress}
        disabled={isLoading}
        style={[
            styles.followBtn,
            {
                backgroundColor: 'rgba(139, 92, 246, 0.2)', // Màu tím nhạt
                borderColor: 'rgba(167, 139, 250, 0.5)',
                borderWidth: 1
            },
            isLoading && { opacity: 0.7 },
            style
        ]}
    >
        {isLoading ? (
            <ActivityIndicator size="small" color="#A78BFA" />
        ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="robot-outline" size={16} color="#A78BFA" style={{ marginRight: 6 }} />
                <Text style={[styles.followBtnText, { color: '#A78BFA' }]}>
                    AI Tóm tắt
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
    const [isDownloading, setIsDownloading] = useState(false); // Giữ lại state download

    // State AI Summary
    const [aiModalVisible, setAiModalVisible] = useState(false);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [aiContent, setAiContent] = useState("");

    // State Diagram
    const [showDiagram, setShowDiagram] = useState(false);
    const [leftNodes, setLeftNodes] = useState<DiagramNode[]>([]);
    const [rightNodes, setRightNodes] = useState<DiagramNode[]>([]);
    const [mappings, setMappings] = useState<Link[]>([]);
    const [positions, setPositions] = useState<{ [key: string]: number }>({});

    // State Report
    const [modalVisible, setModalVisible] = useState(false);
    const [customReason, setCustomReason] = useState("");
    const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
    const [isSendingReport, setIsSendingReport] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const subjectResult = await SubjectService.getFullDetail(code);
                if (!subjectResult) {
                    Alert.alert("Thông báo", `Không tìm thấy dữ liệu: ${code}`);
                    navigation.goBack(); return;
                }
                setData(subjectResult);

                const courseId = subjectResult.info.id || (subjectResult.info as any).syllabusId;

                // Get Tree Relation
                let treeData: CourseNode | null = null;
                if (courseId) {
                    try {
                        const res = await CourseRelationApi.getTree(courseId);
                        treeData = (res as any).data || res;
                    } catch (err) { console.log("Lỗi lấy cây quan hệ:", err); }
                }

                if (treeData) {
                    const rawPre: DiagramNode[] = [];
                    const rawCo: DiagramNode[] = [];
                    const rawEq: DiagramNode[] = [];
                    const tempLeft: DiagramNode[] = [];
                    const seenLeft = new Set<string>();
                    const seenRight = new Set<string>();

                    const traverseTree = (parentNode: CourseNode) => {
                        const pKey = `${parentNode.courseCode}`;
                        if (!seenLeft.has(pKey)) {
                            seenLeft.add(pKey);
                            tempLeft.push({ id: pKey, code: parentNode.courseCode, desc: parentNode.courseName });
                        }

                        const process = (children: CourseNode[] | null, type: 'PREREQUISITE' | 'COREQUISITE' | 'EQUIVALENT') => {
                            if (!children) return;
                            children.forEach(child => {
                                const cKey = `${child.courseCode}_${parentNode.courseCode}_${type}`;
                                if (!seenRight.has(cKey)) {
                                    seenRight.add(cKey);
                                    const node: DiagramNode = {
                                        id: cKey,
                                        code: child.courseCode,
                                        desc: child.courseName,
                                        type: type,
                                        level: child.level || 99
                                    };
                                    if (type === 'PREREQUISITE') rawPre.push(node);
                                    else if (type === 'COREQUISITE') rawCo.push(node);
                                    else rawEq.push(node);
                                }
                                traverseTree(child);
                            });
                        };
                        process(parentNode.prerequisites as any, 'PREREQUISITE');
                        process(parentNode.corequisites as any, 'COREQUISITE');
                        process(parentNode.equivalents as any, 'EQUIVALENT');
                    };
                    traverseTree(treeData);

                    const sortAndLimit = (arr: DiagramNode[]) => arr.sort((a, b) => (a.level || 99) - (b.level || 99)).slice(0, MAX_ITEMS_PER_TYPE);
                    const finalRightNodes = [...sortAndLimit(rawPre), ...sortAndLimit(rawCo), ...sortAndLimit(rawEq)];

                    const finalLinks: Link[] = [];
                    const rootId = tempLeft.length > 0 ? tempLeft[0].id : "";
                    finalRightNodes.forEach(node => {
                        if (rootId) finalLinks.push({ from: rootId, to: node.id, level: node.type || 'PREREQUISITE' });
                    });

                    setLeftNodes(tempLeft.slice(0, 1));
                    setRightNodes(finalRightNodes);
                    setMappings(finalLinks);
                }

                if (courseId) {
                    try {
                        const fList = await CourseInteractionApi.getFollowedCourses();
                        if (Array.isArray(fList) && fList.some((i: any) => i.courseId === courseId)) setIsFollowed(true);
                    } catch (e) { }
                }
            } catch (error) { Alert.alert("Lỗi", "Không thể tải dữ liệu."); } finally { setLoading(false); }
        };
        fetchData();
    }, [code]);

    // --- LOGIC AI SUMMARY ---
    const handleAiSummary = async () => {
        setAiModalVisible(true);
        if (aiContent) return;

        setIsGeneratingAI(true);
        try {
            // --- SỬA LỖI TẠI ĐÂY: Dùng arrow function cho setTimeout ---
            await new Promise(resolve => setTimeout(() => resolve(true), 1500));

            const mockSummary = `🤖 **Tóm tắt môn học: ${data?.info.courseName}**\n\n` +
                `📌 **Mục tiêu:** Môn học cung cấp kiến thức nền tảng về ${data?.info.description?.slice(0, 50)}...\n\n` +
                `💡 **Lời khuyên:**\n` +
                `- Tập trung vào các bài lab thực hành.\n` +
                `- Ôn kỹ các môn tiên quyết để không bị hổng kiến thức.\n` +
                `- Tham khảo tài liệu số 1 trong danh sách để nắm vững lý thuyết.`;
            setAiContent(mockSummary);
        } catch (e) {
            setAiContent("Không thể tạo tóm tắt lúc này.");
        } finally {
            setIsGeneratingAI(false);
        }
    };

    // --- LOGIC DOWNLOAD PDF (ĐÃ GIỮ LẠI) ---
    const handleDownloadSyllabus = async () => {
        if (!data || isDownloading) return;
        const syllabusId = (data.info as any).syllabusId || data.info.id;
        if (!syllabusId) {
            Alert.alert("Thông báo", "Không tìm thấy thông tin giáo trình để tải.");
            return;
        }
        try {
            setIsDownloading(true);
            const path = await SyllabusApi.downloadPdf(syllabusId);
            Alert.alert("Thành công", `File đã được lưu tại thư mục Tải về:\n${path}`);
        } catch (error: any) {
            Alert.alert("Lỗi", error.message || "Tải file thất bại");
        } finally {
            setIsDownloading(false);
        }
    };

    // --- HELPERS ---
    const updatePosition = (key: string, y: number, height: number) => setPositions(prev => ({ ...prev, [key]: y + height / 2 }));
    const getColorByLevel = (l: string) => {
        switch (l?.toUpperCase()) {
            case 'PREREQUISITE': return '#ef4444';
            case 'COREQUISITE': return '#3b82f6';
            case 'EQUIVALENT': return '#eab308';
            default: return '#cbd5e1';
        }
    };
    const getLabelByType = (type?: string) => {
        switch (type) {
            case 'PREREQUISITE': return 'Tiên quyết';
            case 'COREQUISITE': return 'Song hành';
            case 'EQUIVALENT': return 'Tương đương';
            default: return '';
        }
    };

    // --- LOGIC REPORT ---
    const sendReportToApi = async (title: string, description: string) => {
        if (!description.trim()) { Alert.alert("Thông báo", "Vui lòng nhập nội dung."); return; }
        const token = await AsyncStorage.getItem('AUTH_TOKEN');
        if (!token) { Alert.alert("Yêu cầu", "Đăng nhập để gửi báo cáo."); return; }
        setIsSendingReport(true);
        try {
            await ReportApi.createReport({ title, description });
            Alert.alert("Thành công", "Đã gửi báo cáo.");
            setModalVisible(false); setCustomReason("");
        } catch (error) { Alert.alert("Lỗi", "Gửi thất bại."); }
        finally { setIsSendingReport(false); }
    };
    const handleSubmitCustomReason = () => {
        if (selectedMaterial) sendReportToApi(`Lỗi tài liệu: ${selectedMaterial.title}`, customReason);
        else sendReportToApi(`Báo cáo môn: ${data?.info.courseCode}`, customReason);
    };
    const handleReport = (item: any) => { setSelectedMaterial(item); setModalVisible(true); };

    // --- LOGIC FOLLOW ---
    const handleFollowToggle = async () => {
        if (!data || isUpdatingFollow) return;
        const token = await AsyncStorage.getItem('AUTH_TOKEN');
        if (!token) { Alert.alert("Yêu cầu", "Vui lòng đăng nhập."); return; }
        const courseId = data.info.id || (data.info as any).syllabusId;
        setIsUpdatingFollow(true); const prev = isFollowed; setIsFollowed(!prev);
        try {
            if (prev) await CourseInteractionApi.unfollowCourse(courseId);
            else await CourseInteractionApi.followCourse(courseId);
        } catch (e) { setIsFollowed(prev); } finally { setIsUpdatingFollow(false); }
    };

    if (loading) return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color="#15803d" /></View>;
    if (!data) return <View style={styles.container}><Text>Không có dữ liệu</Text></View>;

    const { info, plans, assessments, materials } = data;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                {/* HEADER */}
                <LinearGradient colors={["#32502a", "#20331b"]} style={styles.header}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ flex: 1, paddingRight: 10 }}>
                            <Text style={styles.code}>{info.courseCode}</Text>
                            <Text style={styles.title}>{info.courseName}</Text>
                            <Text style={styles.subtitle}>{info.deptName}</Text>
                        </View>
                        <Icon name="book-education-outline" size={60} color="rgba(255,255,255,0.1)" />
                    </View>

                    {/* HÀNG NÚT BẤM (Follow + AI Summary + Download) */}
                    <View style={{ flexDirection: 'row', marginTop: 15, gap: 8 }}>
                        {/* 1. Nút Theo dõi */}
                        <FollowButton
                            isFollowed={isFollowed}
                            isLoading={isUpdatingFollow}
                            onPress={handleFollowToggle}
                            style={{ flex: 1.2 }}
                        />

                        {/* 2. Nút AI Summary */}
                        <AiSummaryButton
                            isLoading={isGeneratingAI && !aiModalVisible}
                            onPress={handleAiSummary}
                            style={{ flex: 1 }}
                        />

                        {/* 3. Nút Download PDF (GIỮ LẠI) */}
                        <TouchableOpacity
                            onPress={handleDownloadSyllabus}
                            disabled={isDownloading}
                            style={{
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                borderRadius: 20, paddingVertical: 8, paddingHorizontal: 12,
                                borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
                                flex: 0.8, alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            {isDownloading ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Icon name="cloud-download-outline" size={18} color="#FFF" style={{ marginRight: 4 }} />
                                    <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 13 }}>Tải về</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                <Section title="Mô tả tóm tắt"><Text style={styles.missionText}>{info.description}</Text></Section>
                <Section title="Thông tin chi tiết">
                    <InfoRow label="Giảng viên" value={info.lecturerName} icon="account-tie" />
                    <InfoRow label="Tín chỉ" value={info.credit} icon="star-circle-outline" />
                    <InfoRow label="Năm học" value={info.academicYear} icon="calendar-range" />
                    <InfoRow label="Loại hình" value={info.type} icon="shape-outline" />
                </Section>

                {/* SƠ ĐỒ CÂY */}
                <View style={{ marginTop: 10, marginHorizontal: 16 }}>
                    <TouchableOpacity style={styles.toggleBtn} onPress={() => setShowDiagram(!showDiagram)}>
                        <Icon name={showDiagram ? "chevron-up" : "chevron-down"} size={20} color="#0284C7" />
                        <Text style={styles.toggleBtnText}>{showDiagram ? "Thu gọn cây quan hệ môn học" : "Xem cây quan hệ môn học"}</Text>
                    </TouchableOpacity>
                    {showDiagram && (
                        <View style={[styles.section, { marginHorizontal: 0, marginTop: 16 }]}>
                            <Text style={styles.sectionTitle}>Cấu trúc môn học</Text>
                            {(leftNodes.length > 0 && rightNodes.length > 0) ? (
                                <>
                                    <View style={styles.diagramContainer}>
                                        <Svg style={styles.svgLayer}>
                                            {mappings.map((m, i) => {
                                                const y1 = positions[m.from]; const y2 = positions[m.to];
                                                if (y1 !== undefined && y2 !== undefined) return <Line key={i} x1="30%" y1={y1} x2="70%" y2={y2} stroke={getColorByLevel(m.level)} strokeWidth="2" strokeOpacity={0.6} />;
                                                return null;
                                            })}
                                        </Svg>
                                        <View style={styles.column}>
                                            <Text style={styles.colTitle}>Môn Gốc</Text>
                                            {leftNodes.map(n => (<View key={n.id} style={[styles.node, styles.ploNode]} onLayout={(e) => updatePosition(n.id, e.nativeEvent.layout.y, e.nativeEvent.layout.height)}><Text style={styles.nodeTitle}>{n.code}</Text></View>))}
                                        </View>
                                        <View style={styles.column}>
                                            <Text style={styles.colTitle}>Điều kiện</Text>
                                            {rightNodes.map(n => (
                                                <View key={n.id} style={[styles.node, styles.cloNode, { borderLeftColor: getColorByLevel(n.type || ''), borderLeftWidth: 4 }]} onLayout={(e) => updatePosition(n.id, e.nativeEvent.layout.y, e.nativeEvent.layout.height)}>
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                                                        <Text style={[styles.nodeTitle, { fontSize: 12 }]}>{n.code}</Text>
                                                        <Text style={{ fontSize: 9, color: getColorByLevel(n.type || ''), fontWeight: 'bold' }}>{getLabelByType(n.type)}</Text>
                                                    </View>
                                                    <Text style={styles.nodeDesc} numberOfLines={1}>{n.desc}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                                        <Text style={{ fontSize: 10, color: '#ef4444', fontWeight: '600' }}>● Tiên quyết</Text>
                                        <Text style={{ fontSize: 10, color: '#3b82f6', fontWeight: '600' }}>● Song hành</Text>
                                        <Text style={{ fontSize: 10, color: '#eab308', fontWeight: '600' }}>● Tương đương</Text>
                                    </View>
                                </>
                            ) : (<View style={{ padding: 20, alignItems: 'center' }}><Icon name="link-variant-off" size={40} color="#CBD5E1" /><Text style={{ marginTop: 8, color: '#64748B' }}>Không có môn học liên quan</Text></View>)}
                        </View>
                    )}
                </View>

                {plans.length > 0 && (
                    <Section title="Kế hoạch giảng dạy">
                        {plans.sort((a, b) => a.weekNo - b.weekNo).map((item, index) => (
                            <View key={index} style={styles.timelineItem}>
                                <View style={styles.timelineLeft}><View style={styles.timelineDot}><Text style={styles.weekNum}>{item.weekNo}</Text></View>{index < plans.length - 1 && <View style={styles.timelineLine} />}</View>
                                <View style={styles.timelineContent}><Text style={styles.topic}>{item.topic}</Text><Text style={styles.method}>PP: {item.teachingMethod}</Text></View>
                            </View>
                        ))}
                    </Section>
                )}

                {assessments.length > 0 && (
                    <Section title="Đánh giá & Điểm số">
                        {assessments.map((item, index) => (
                            <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}><Icon name="clipboard-check-outline" size={18} color="#64748B" style={{ marginRight: 8 }} /><Text style={{ color: '#334155', fontWeight: '600', fontSize: 14 }}>{item.name}</Text></View>
                                <View style={{ backgroundColor: '#DBEAFE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}><Text style={{ fontWeight: '800', color: '#2563EB', fontSize: 14 }}>{item.weightPercent}%</Text></View>
                            </View>
                        ))}
                    </Section>
                )}

                {materials.length > 0 && (
                    <Section title="Tài liệu tham khảo">
                        {materials.map((item, index) => (
                            <View key={index} style={styles.bulletItem}>
                                <Text style={styles.bulletIndex}>{index + 1}</Text>
                                <View style={styles.bulletContent}>
                                    <Text style={styles.bulletTitle}>{item.title}</Text>
                                    <Text style={styles.bulletSubtitle}>{item.author} ({item.materialType})</Text>
                                    <TouchableOpacity onPress={() => handleReport(item)} style={styles.reportBtn}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}><Icon name="flag-outline" size={14} color="#EF4444" style={{ marginRight: 4 }} /><Text style={styles.reportText}>Báo lỗi</Text></View>
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
                            <TouchableOpacity style={[styles.button, styles.buttonConfirm]} onPress={handleSubmitCustomReason} disabled={isSendingReport}>
                                {isSendingReport ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.textConfirm}>Gửi báo cáo</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* MODAL AI SUMMARY */}
            <Modal transparent visible={aiModalVisible} onRequestClose={() => setAiModalVisible(false)} animationType="slide">
                <View style={[styles.modalOverlay, { justifyContent: 'flex-end', margin: 0 }]}>
                    <View style={[styles.modalView, { width: '100%', borderTopLeftRadius: 20, borderTopRightRadius: 20, borderRadius: 0, paddingBottom: 40, height: '60%' }]}>
                        <View style={{ width: 40, height: 5, backgroundColor: '#E2E8F0', borderRadius: 10, alignSelf: 'center', marginBottom: 15 }} />

                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                            <Icon name="robot" size={24} color="#8B5CF6" style={{ marginRight: 8 }} />
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937' }}>AI Tóm tắt</Text>
                        </View>

                        {isGeneratingAI ? (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <ActivityIndicator size="large" color="#8B5CF6" />
                                <Text style={{ marginTop: 10, color: '#6B7280' }}>Đang phân tích dữ liệu...</Text>
                            </View>
                        ) : (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <Text style={{ fontSize: 15, lineHeight: 24, color: '#374151' }}>{aiContent}</Text>
                            </ScrollView>
                        )}

                        <TouchableOpacity
                            style={[styles.button, styles.buttonConfirm, { marginTop: 20, backgroundColor: '#8B5CF6' }]}
                            onPress={() => setAiModalVisible(false)}
                        >
                            <Text style={styles.textConfirm}>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}