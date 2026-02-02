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
// Import API và Type mới
import { CourseRelationApi } from "../../../../backend/api/CourseRelationshipApi";
import { CourseNode } from "../../../../backend/types/CourseRelationShip";
import { SubjectDetailData } from "../../../../backend/types/SubjectDetail";

/* --- TYPES --- */
type RouteParams = {
    SubjectDetail: { code: string; name?: string; }
};
type DiagramNode = {
    id: string; // Dùng composite key để tránh trùng lặp
    code: string;
    desc?: string;
    y?: number
}
type Link = {
    from: string; // ID của node trái
    to: string;   // ID của node phải
    level: string; // Loại quan hệ
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

    // State Diagram (Relation Tree)
    const [showDiagram, setShowDiagram] = useState(false);
    const [leftNodes, setLeftNodes] = useState<DiagramNode[]>([]);
    const [rightNodes, setRightNodes] = useState<DiagramNode[]>([]);
    const [mappings, setMappings] = useState<Link[]>([]);
    const [positions, setPositions] = useState<{ [key: string]: number }>({});

    // State Report
    const [modalVisible, setModalVisible] = useState(false);
    const [customReason, setCustomReason] = useState("");
    const [selectedMaterial, setSelectedMaterial] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // 1. Lấy thông tin chi tiết môn học
                const subjectResult = await SubjectService.getFullDetail(code);
                if (!subjectResult) {
                    Alert.alert("Thông báo", `Không tìm thấy dữ liệu: ${code}`);
                    navigation.goBack();
                    return;
                }
                setData(subjectResult);

                const courseId = subjectResult.info.id || (subjectResult.info as any).syllabusId;

                // 2. Lấy Cây Quan Hệ (Recursive Tree)
                let treeData: CourseNode | null = null;
                if (courseId) {
                    try {
                        const res = await CourseRelationApi.getTree(courseId);
                        treeData = (res as any).data || res;
                    } catch (err) {
                        console.log("Lỗi lấy cây quan hệ:", err);
                    }
                }

                // 3. Xử lý dữ liệu Cây -> Danh sách phẳng (Edges)
                if (treeData) {
                    const newLeftNodes: DiagramNode[] = [];
                    const newRightNodes: DiagramNode[] = [];
                    const newLinks: Link[] = [];

                    const seenLeft = new Set<string>();
                    const seenRight = new Set<string>();

                    // Hàm đệ quy duyệt cây
                    const traverseTree = (parentNode: CourseNode) => {
                        const processChildren = (children: CourseNode[] | null, type: string) => {
                            if (!children || children.length === 0) return;

                            children.forEach(child => {
                                // Tạo Key duy nhất để vẽ (tránh trùng nếu môn xuất hiện nhiều lần)
                                const parentKey = `${parentNode.courseCode}`;
                                const childKey = `${child.courseCode}_${parentNode.courseCode}_${type}`; // Unique child per parent relation

                                // Thêm Node Trái (Parent)
                                if (!seenLeft.has(parentKey)) {
                                    seenLeft.add(parentKey);
                                    newLeftNodes.push({
                                        id: parentKey,
                                        code: parentNode.courseCode,
                                        desc: parentNode.courseName
                                    });
                                }

                                // Thêm Node Phải (Child)
                                if (!seenRight.has(childKey)) {
                                    seenRight.add(childKey);
                                    newRightNodes.push({
                                        id: childKey,
                                        code: child.courseCode,
                                        desc: child.courseName
                                    });
                                }

                                // Tạo dây nối
                                newLinks.push({
                                    from: parentKey,
                                    to: childKey,
                                    level: type
                                });

                                // Tiếp tục đệ quy xuống con của child
                                traverseTree(child);
                            });
                        };

                        processChildren(parentNode.prerequisites, 'PREREQUISITE');
                        processChildren(parentNode.corequisites, 'COREQUISITE');
                        processChildren(parentNode.equivalents, 'EQUIVALENT');
                    };

                    // Bắt đầu duyệt từ Root
                    traverseTree(treeData);

                    setLeftNodes(newLeftNodes);
                    setRightNodes(newRightNodes);
                    setMappings(newLinks);
                }

                // 4. Check Follow
                if (courseId) {
                    try {
                        const followedList = await CourseInteractionApi.getFollowedCourses();
                        if (Array.isArray(followedList)) {
                            const isFound = followedList.some((item: any) => item.courseId === courseId);
                            setIsFollowed(isFound);
                        }
                    } catch (e) { }
                }

            } catch (error) {
                console.error(error);
                Alert.alert("Lỗi", "Không thể tải dữ liệu.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [code]);

    // --- HELPERS ---
    const getColorByLevel = (level: string) => {
        switch (level?.toUpperCase()) {
            case 'PREREQUISITE': return '#ef4444'; // Đỏ
            case 'COREQUISITE': return '#3b82f6'; // Xanh
            case 'EQUIVALENT': return '#eab308'; // Vàng
            default: return '#cbd5e1';
        }
    };

    const updatePosition = (key: string, y: number, height: number) => {
        setPositions(prev => ({ ...prev, [key]: y + height / 2 }));
    };

    // --- HANDLERS (Giữ nguyên) ---
    const handleFollowToggle = async () => { /* ... Giữ nguyên code cũ ... */
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
        } catch (e) { setIsFollowed(prev); Alert.alert("Lỗi", "Cập nhật thất bại"); }
        finally { setIsUpdatingFollow(false); }
    };

    const sendReportToApi = async (title: string, desc: string) => { /* ... Giữ nguyên ... */ };
    const handleSubmitCustomReason = () => { setModalVisible(false); };
    const handleReport = (item: any) => { setSelectedMaterial(item); setModalVisible(true); };

    // --- RENDER ---
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
                    <FollowButton isFollowed={isFollowed} isLoading={isUpdatingFollow} onPress={handleFollowToggle} />
                </LinearGradient>

                <Section title="Mô tả tóm tắt">
                    <Text style={styles.missionText}>{info.description}</Text>
                </Section>
                <Section title="Thông tin chi tiết">
                    <InfoRow label="Giảng viên" value={info.lecturerName} icon="account-tie" />
                    <InfoRow label="Tín chỉ" value={info.credit} icon="star-circle-outline" />
                    <InfoRow label="Năm học" value={info.academicYear} icon="calendar-range" />
                    <InfoRow label="Loại hình" value={info.type} icon="shape-outline" />
                </Section>

                {/* SƠ ĐỒ CÂY QUAN HỆ */}
                <View style={{ marginTop: 10, marginHorizontal: 16 }}>
                    <TouchableOpacity style={styles.toggleBtn} onPress={() => setShowDiagram(!showDiagram)}>
                        <Icon name={showDiagram ? "chevron-up" : "chevron-down"} size={20} color="#0284C7" />
                        <Text style={styles.toggleBtnText}>
                            {showDiagram ? "Thu gọn cây quan hệ môn học" : "Xem cây quan hệ môn học"}
                        </Text>
                    </TouchableOpacity>

                    {showDiagram && (
                        <View style={[styles.section, { marginHorizontal: 0, marginTop: 16 }]}>
                            <Text style={styles.sectionTitle}>Cấu trúc môn học</Text>
                            {(leftNodes.length > 0 && rightNodes.length > 0) ? (
                                <>
                                    <View style={styles.diagramContainer}>
                                        <Svg style={styles.svgLayer}>
                                            {mappings.map((m, i) => {
                                                const y1 = positions[m.from];
                                                const y2 = positions[m.to];
                                                // Chỉ vẽ dây nếu cả 2 điểm đã render xong vị trí
                                                if (y1 !== undefined && y2 !== undefined) {
                                                    return (
                                                        <Line key={i} x1="25%" y1={y1} x2="75%" y2={y2}
                                                            stroke={getColorByLevel(m.level)} strokeWidth="2" strokeOpacity={0.6} />
                                                    );
                                                }
                                                return null;
                                            })}
                                        </Svg>

                                        {/* CỘT TRÁI: MÔN CHA / MÔN GỐC */}
                                        <View style={styles.column}>
                                            <Text style={styles.colTitle}>Môn Gốc / Cha</Text>
                                            {leftNodes.map(node => (
                                                <View key={node.id} style={[styles.node, styles.ploNode]}
                                                    onLayout={(e) => updatePosition(node.id, e.nativeEvent.layout.y, e.nativeEvent.layout.height)}>
                                                    <Text style={styles.nodeTitle}>{node.code}</Text>
                                                </View>
                                            ))}
                                        </View>

                                        {/* CỘT PHẢI: MÔN CON / ĐIỀU KIỆN */}
                                        <View style={styles.column}>
                                            <Text style={styles.colTitle}>Môn Điều Kiện</Text>
                                            {rightNodes.map(node => (
                                                <View key={node.id} style={[styles.node, styles.cloNode]}
                                                    onLayout={(e) => updatePosition(node.id, e.nativeEvent.layout.y, e.nativeEvent.layout.height)}>
                                                    <Text style={styles.nodeTitle}>{node.code}</Text>
                                                    <Text style={styles.nodeDesc} numberOfLines={1}>{node.desc}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>

                                    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 10 }}>
                                        <Text style={{ fontSize: 10, color: '#ef4444', fontWeight: '600' }}>● Tiên quyết</Text>
                                        <Text style={{ fontSize: 10, color: '#3b82f6', fontWeight: '600' }}>● Song hành</Text>
                                        <Text style={{ fontSize: 10, color: '#eab308', fontWeight: '600' }}>● Tương đương</Text>
                                    </View>
                                </>
                            ) : (
                                <View style={{ padding: 20, alignItems: 'center' }}>
                                    <Icon name="link-variant-off" size={40} color="#CBD5E1" />
                                    <Text style={{ marginTop: 8, color: '#64748B', fontStyle: 'italic' }}>Không có môn học liên quan</Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>

                {/* KẾ HOẠCH GIẢNG DẠY */}
                {plans.length > 0 && (
                    <Section title="Kế hoạch giảng dạy">
                        {plans.sort((a, b) => a.weekNo - b.weekNo).map((item, index) => (
                            <View key={index} style={styles.timelineItem}>
                                <View style={styles.timelineLeft}>
                                    <View style={styles.timelineDot}><Text style={styles.weekNum}>{item.weekNo}</Text></View>
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

                {/* ĐÁNH GIÁ & TÀI LIỆU (Giữ nguyên) */}
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