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

/* --- TYPES --- */
type RouteParams = {
    SubjectDetail: { code: string; name?: string; }
};
// Thêm type 'type' và 'level' để phân loại màu sắc và priority
type DiagramNode = {
    id: string;
    code: string;
    desc?: string;
    y?: number;
    type?: 'PREREQUISITE' | 'COREQUISITE' | 'EQUIVALENT';
    level?: number; // Dùng để sort priority
};
type Link = { from: string; to: string; level: string; };

/* --- CONFIG LIMIT --- */
const MAX_ITEMS_PER_TYPE = 3; // Giới hạn mỗi loại chỉ hiện tối đa 3 môn

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
                // 1. Get Detail
                const subjectResult = await SubjectService.getFullDetail(code);
                if (!subjectResult) {
                    Alert.alert("Thông báo", `Không tìm thấy dữ liệu: ${code}`);
                    navigation.goBack(); return;
                }
                setData(subjectResult);

                const courseId = subjectResult.info.id || (subjectResult.info as any).syllabusId;

                // 2. Get Tree Relation
                let treeData: CourseNode | null = null;
                if (courseId) {
                    try {
                        const res = await CourseRelationApi.getTree(courseId);
                        treeData = (res as any).data || res;
                    } catch (err) { console.log("Lỗi lấy cây quan hệ:", err); }
                }

                // 3. Process Tree (Logic Mới: Phân loại, Sắp xếp Priority & Giới hạn)
                if (treeData) {
                    const tempLeft: DiagramNode[] = [];
                    // Dùng 3 mảng tạm để chứa các loại quan hệ
                    const rawPre: DiagramNode[] = [];
                    const rawCo: DiagramNode[] = [];
                    const rawEq: DiagramNode[] = [];
                    const seenLeft = new Set<string>();
                    const seenRight = new Set<string>();

                    const traverseTree = (parentNode: CourseNode) => {
                        // Thêm Node Gốc (Left Column)
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
                                        level: child.level || 99 // Priority: Level càng nhỏ càng ưu tiên
                                    };

                                    // Phân loại vào từng giỏ
                                    if (type === 'PREREQUISITE') rawPre.push(node);
                                    else if (type === 'COREQUISITE') rawCo.push(node);
                                    else rawEq.push(node);
                                }
                                // Đệ quy tiếp tục
                                traverseTree(child);
                            });
                        };

                        process(parentNode.prerequisites as any, 'PREREQUISITE');
                        process(parentNode.corequisites as any, 'COREQUISITE');
                        process(parentNode.equivalents as any, 'EQUIVALENT');
                    };

                    traverseTree(treeData);

                    // --- LOGIC SẮP XẾP VÀ GIỚI HẠN (Priority Logic) ---
                    const sortAndLimit = (arr: DiagramNode[]) => {
                        return arr
                            .sort((a, b) => (a.level || 99) - (b.level || 99)) // Ưu tiên level nhỏ
                            .slice(0, MAX_ITEMS_PER_TYPE); // Cắt lấy top N
                    };

                    const finalRightNodes = [
                        ...sortAndLimit(rawPre),
                        ...sortAndLimit(rawCo),
                        ...sortAndLimit(rawEq)
                    ];

                    // Tạo lại đường nối
                    const finalLinks: Link[] = [];
                    const rootId = tempLeft.length > 0 ? tempLeft[0].id : "";

                    finalRightNodes.forEach(node => {
                        if (rootId) {
                            finalLinks.push({
                                from: rootId,
                                to: node.id,
                                level: node.type || 'PREREQUISITE'
                            });
                        }
                    });

                    setLeftNodes(tempLeft.slice(0, 1)); // Chỉ lấy 1 node gốc chính
                    setRightNodes(finalRightNodes);
                    setMappings(finalLinks);
                }

                // 4. Check Follow
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

    // --- HELPERS ---
    const updatePosition = (key: string, y: number, height: number) => setPositions(prev => ({ ...prev, [key]: y + height / 2 }));

    // Màu sắc dựa trên loại quan hệ
    const getColorByLevel = (l: string) => {
        switch (l?.toUpperCase()) {
            case 'PREREQUISITE': return '#ef4444'; // Đỏ
            case 'COREQUISITE': return '#3b82f6'; // Xanh
            case 'EQUIVALENT': return '#eab308'; // Vàng
            default: return '#cbd5e1';
        }
    };

    // Label hiển thị loại quan hệ
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
                    {/* CHỈ CÒN NÚT FOLLOW */}
                    <View style={{ flexDirection: 'row', marginTop: 15 }}>
                        <FollowButton isFollowed={isFollowed} isLoading={isUpdatingFollow} onPress={handleFollowToggle} style={{ flex: 1 }} />
                    </View>
                </LinearGradient>

                <Section title="Mô tả tóm tắt"><Text style={styles.missionText}>{info.description}</Text></Section>
                <Section title="Thông tin chi tiết">
                    <InfoRow label="Giảng viên" value={info.lecturerName} icon="account-tie" />
                    <InfoRow label="Tín chỉ" value={info.credit} icon="star-circle-outline" />
                    <InfoRow label="Năm học" value={info.academicYear} icon="calendar-range" />
                    <InfoRow label="Loại hình" value={info.type} icon="shape-outline" />
                </Section>

                {/* SƠ ĐỒ QUAN HỆ (ĐÃ CẬP NHẬT GIAO DIỆN) */}
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

                                        {/* Cột Trái: Môn Gốc */}
                                        <View style={styles.column}>
                                            <Text style={styles.colTitle}>Môn</Text>
                                            {leftNodes.map(n => (
                                                <View key={n.id} style={[styles.node, styles.ploNode]} onLayout={(e) => updatePosition(n.id, e.nativeEvent.layout.y, e.nativeEvent.layout.height)}>
                                                    <Text style={styles.nodeTitle}>{n.code}</Text>
                                                </View>
                                            ))}
                                        </View>

                                        {/* Cột Phải: Các môn điều kiện (Đã sắp xếp & Phân loại) */}
                                        <View style={styles.column}>
                                            <Text style={styles.colTitle}>Môn điều kiện</Text>
                                            {rightNodes.map((n) => (
                                                <View key={n.id}
                                                    style={[
                                                        styles.node,
                                                        styles.cloNode,
                                                        { borderLeftColor: getColorByLevel(n.type || ''), borderLeftWidth: 4 } // Viền trái màu theo loại
                                                    ]}
                                                    onLayout={(e) => updatePosition(n.id, e.nativeEvent.layout.y, e.nativeEvent.layout.height)}
                                                >
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                                                        <Text style={[styles.nodeTitle, { fontSize: 12 }]}>{n.code}</Text>
                                                        <Text style={{ fontSize: 9, color: getColorByLevel(n.type || ''), fontWeight: 'bold' }}>
                                                            {getLabelByType(n.type)}
                                                        </Text>
                                                    </View>
                                                    <Text style={styles.nodeDesc} numberOfLines={1}>{n.desc}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>

                                    {/* Chú thích màu */}
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
        </View>
    );
}