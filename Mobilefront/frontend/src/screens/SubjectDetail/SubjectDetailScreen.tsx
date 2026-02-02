import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Line } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

/* --- IMPORT CUSTOM --- */
import styles from './SubjectDetailScreen.styles';
import { SubjectService } from '../../../../backend/Service/SubjectService';
// 1. IMPORT API REPORT
import { ReportApi } from '../../../../backend/api/ReportApi';
import { CourseInteractionApi } from '../../../../backend/api/CourseInteractionApi';
import { CourseRelationApi } from '../../../../backend/api/CourseRelationshipApi';
// 2. IMPORT API SYLLABUS DOWNLOAD
import { SyllabusApi } from '../../../../backend/api/SyllabusApi';
import { CourseNode } from '../../../../backend/types/CourseRelationShip';
import { SubjectDetailData } from '../../../../backend/types/SubjectDetail';

/* --- TYPES --- */
type RouteParams = {
  SubjectDetail: { code: string; name?: string };
};
type DiagramNode = { id: string; code: string; desc?: string; y?: number };
type Link = { from: string; to: string; level: string };

/* --- COMPONENTS CON --- */
const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const InfoRow = ({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string | number;
  icon?: string;
}) => (
  <View style={styles.infoRow}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {icon && (
        <Icon
          name={icon}
          size={18}
          color="#94A3B8"
          style={{ marginRight: 8 }}
        />
      )}
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
    <Text style={styles.infoValue}>{value || '—'}</Text>
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
      style,
    ]}
  >
    {isLoading ? (
      <ActivityIndicator size="small" color={isFollowed ? '#15803d' : '#FFF'} />
    ) : (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon
          name={isFollowed ? 'check-circle' : 'plus-circle'}
          size={16}
          color={isFollowed ? '#15803d' : '#FFF'}
          style={{ marginRight: 6 }}
        />
        <Text
          style={[
            styles.followBtnText,
            isFollowed ? styles.followTextActive : styles.followTextInactive,
          ]}
        >
          {isFollowed ? 'Đã theo dõi' : 'Theo dõi'}
        </Text>
      </View>
    )}
  </TouchableOpacity>
);

const DownloadButton = ({ isLoading, onPress, style }: any) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={isLoading}
    style={[styles.downloadButton, isLoading && { opacity: 0.7 }, style]}
  >
    {isLoading ? (
      <ActivityIndicator size="small" color="#FFF" />
    ) : (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon
          name="download"
          size={16}
          color="#FFF"
          style={{ marginRight: 6 }}
        />
        <Text style={styles.downloadButtonText}>Tải PDF</Text>
      </View>
    )}
  </TouchableOpacity>
);

/* --- MAIN SCREEN --- */
export default function SubjectDetailScreen() {
  const route = useRoute<RouteProp<RouteParams, 'SubjectDetail'>>();
  const navigation = useNavigation();
  const { code } = route.params;

  // State Data
  const [data, setData] = useState<SubjectDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // State Logic
  const [isFollowed, setIsFollowed] = useState(false);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // State Diagram
  const [showDiagram, setShowDiagram] = useState(false);
  const [leftNodes, setLeftNodes] = useState<DiagramNode[]>([]);
  const [rightNodes, setRightNodes] = useState<DiagramNode[]>([]);
  const [mappings, setMappings] = useState<Link[]>([]);
  const [positions, setPositions] = useState<{ [key: string]: number }>({});

  // State Report
  const [modalVisible, setModalVisible] = useState(false);
  const [customReason, setCustomReason] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [isSendingReport, setIsSendingReport] = useState(false); // Loading khi gửi report

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const subjectResult = await SubjectService.getFullDetail(code);
        if (!subjectResult) {
          Alert.alert('Thông báo', `Không tìm thấy dữ liệu: ${code}`);
          navigation.goBack();
          return;
        }
        setData(subjectResult);

        const courseId =
          subjectResult.info.id || (subjectResult.info as any).syllabusId;

        // Get Tree Relation
        let treeData: CourseNode | null = null;
        if (courseId) {
          try {
            const res = await CourseRelationApi.getTree(courseId);
            treeData = (res as any).data || res;
          } catch (err) {
            console.log('Lỗi lấy cây quan hệ:', err);
          }
        }

        if (treeData) {
          const newLeft: DiagramNode[] = [],
            newRight: DiagramNode[] = [],
            newLinks: Link[] = [];
          const seenLeft = new Set<string>(),
            seenRight = new Set<string>();

          const traverseTree = (parentNode: CourseNode) => {
            const process = (children: CourseNode[] | null, type: string) => {
              if (!children) return;
              children.forEach(child => {
                const pKey = `${parentNode.courseCode}`;
                const cKey = `${child.courseCode}_${parentNode.courseCode}_${type}`;
                if (!seenLeft.has(pKey)) {
                  seenLeft.add(pKey);
                  newLeft.push({
                    id: pKey,
                    code: parentNode.courseCode,
                    desc: parentNode.courseName,
                  });
                }
                if (!seenRight.has(cKey)) {
                  seenRight.add(cKey);
                  newRight.push({
                    id: cKey,
                    code: child.courseCode,
                    desc: child.courseName,
                  });
                }
                newLinks.push({ from: pKey, to: cKey, level: type });
                traverseTree(child);
              });
            };
            process(parentNode.prerequisites, 'PREREQUISITE');
            process(parentNode.corequisites, 'COREQUISITE');
            process(parentNode.equivalents, 'EQUIVALENT');
          };
          traverseTree(treeData);
          setLeftNodes(newLeft);
          setRightNodes(newRight);
          setMappings(newLinks);
        }

        if (courseId) {
          try {
            const fList = await CourseInteractionApi.getFollowedCourses();
            if (
              Array.isArray(fList) &&
              fList.some((i: any) => i.courseId === courseId)
            )
              setIsFollowed(true);
          } catch (e) {}
        }
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể tải dữ liệu.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [code]);

  // --- HELPERS ---
  const updatePosition = (key: string, y: number, height: number) =>
    setPositions(prev => ({ ...prev, [key]: y + height / 2 }));
  const getColorByLevel = (l: string) => {
    switch (l?.toUpperCase()) {
      case 'PREREQUISITE':
        return '#ef4444';
      case 'COREQUISITE':
        return '#3b82f6';
      case 'EQUIVALENT':
        return '#eab308';
      default:
        return '#cbd5e1';
    }
  };

  // --- LOGIC REPORT (API GẮN TẠI ĐÂY) ---

  // Hàm gọi API thực sự
  const sendReportToApi = async (title: string, description: string) => {
    if (!description.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung chi tiết.');
      return;
    }

    const token = await AsyncStorage.getItem('AUTH_TOKEN');
    if (!token) {
      Alert.alert('Yêu cầu', 'Vui lòng đăng nhập để gửi báo cáo.');
      return;
    }

    setIsSendingReport(true);

    try {
      // Gọi ReportApi
      await ReportApi.createReport({
        title: title,
        description: description,
      });

      Alert.alert(
        'Thành công',
        'Cảm ơn bạn đã đóng góp ý kiến. Chúng tôi sẽ xem xét sớm nhất.',
      );
      setModalVisible(false);
      setCustomReason('');
    } catch (error) {
      console.error('Report Error:', error);
      Alert.alert('Lỗi', 'Gửi báo cáo thất bại. Vui lòng thử lại sau.');
    } finally {
      setIsSendingReport(false);
    }
  };

  // Xử lý khi nhấn nút Gửi trong Modal
  const handleSubmitCustomReason = () => {
    if (selectedMaterial) {
      sendReportToApi(
        `Báo lỗi tài liệu: ${selectedMaterial.title}`,
        customReason,
      );
    } else {
      sendReportToApi(
        `Báo cáo môn học: ${data?.info.courseCode}`,
        customReason,
      );
    }
  };

  // Mở Modal khi nhấn nút Báo lỗi (icon cờ)
  const handleReport = (item: any) => {
    setSelectedMaterial(item);
    setModalVisible(true);
  };

  // --- LOGIC DOWNLOAD PDF ---
  const handleDownloadPdf = async () => {
    if (!data || isDownloading) return;

    const token = await AsyncStorage.getItem('AUTH_TOKEN');
    if (!token) {
      Alert.alert('Yêu cầu', 'Vui lòng đăng nhập để tải file.');
      return;
    }

    const syllabusId = data.info.id || (data.info as any).syllabusId;
    if (!syllabusId) {
      Alert.alert('Lỗi', 'Không tìm thấy ID đề cương.');
      return;
    }

    setIsDownloading(true);
    try {
      const filePath = await SyllabusApi.downloadPdf(syllabusId);
      Alert.alert('Thành công', `File đã được lưu tại:\n${filePath}`, [
        { text: 'OK' },
      ]);
    } catch (error: any) {
      console.error('Download Error:', error);
      Alert.alert(
        'Lỗi',
        error.message || 'Không thể tải file. Vui lòng thử lại sau.',
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // --- LOGIC FOLLOW ---
  const handleFollowToggle = async () => {
    if (!data || isUpdatingFollow) return;
    const token = await AsyncStorage.getItem('AUTH_TOKEN');
    if (!token) {
      Alert.alert('Yêu cầu', 'Vui lòng đăng nhập.');
      return;
    }
    const courseId = data.info.id || (data.info as any).syllabusId;
    setIsUpdatingFollow(true);
    const prev = isFollowed;
    setIsFollowed(!prev);
    try {
      if (prev) await CourseInteractionApi.unfollowCourse(courseId);
      else await CourseInteractionApi.followCourse(courseId);
    } catch (e) {
      setIsFollowed(prev);
      Alert.alert('Lỗi', 'Cập nhật thất bại');
    } finally {
      setIsUpdatingFollow(false);
    }
  };

  if (loading)
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color="#15803d" />
      </View>
    );
  if (!data)
    return (
      <View style={styles.container}>
        <Text>Không có dữ liệu</Text>
      </View>
    );

  const { info, plans, assessments, materials } = data;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <LinearGradient colors={['#32502a', '#20331b']} style={styles.header}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.code}>{info.courseCode}</Text>
              <Text style={styles.title}>{info.courseName}</Text>
              <Text style={styles.subtitle}>{info.deptName}</Text>
            </View>
            <Icon
              name="book-education-outline"
              size={60}
              color="rgba(255,255,255,0.1)"
            />
          </View>

          {/* HÀNG NÚT BẤM: FOLLOW + DOWNLOAD */}
          <View style={{ flexDirection: 'row', marginTop: 15, gap: 10 }}>
            <FollowButton
              isFollowed={isFollowed}
              isLoading={isUpdatingFollow}
              onPress={handleFollowToggle}
              style={{ flex: 1 }}
            />
            <DownloadButton
              isLoading={isDownloading}
              onPress={handleDownloadPdf}
              style={{ flex: 1 }}
            />
          </View>
        </LinearGradient>

        <Section title="Mô tả tóm tắt">
          <Text style={styles.missionText}>{info.description}</Text>
        </Section>
        <Section title="Thông tin chi tiết">
          <InfoRow
            label="Giảng viên"
            value={info.lecturerName}
            icon="account-tie"
          />
          <InfoRow
            label="Tín chỉ"
            value={info.credit}
            icon="star-circle-outline"
          />
          <InfoRow
            label="Năm học"
            value={info.academicYear}
            icon="calendar-range"
          />
          <InfoRow label="Loại hình" value={info.type} icon="shape-outline" />
        </Section>

        {/* Sơ đồ cây */}
        <View style={{ marginTop: 10, marginHorizontal: 16 }}>
          <TouchableOpacity
            style={styles.toggleBtn}
            onPress={() => setShowDiagram(!showDiagram)}
          >
            <Icon
              name={showDiagram ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#0284C7"
            />
            <Text style={styles.toggleBtnText}>
              {showDiagram
                ? 'Thu gọn cây quan hệ môn học'
                : 'Xem cây quan hệ môn học'}
            </Text>
          </TouchableOpacity>
          {showDiagram && (
            <View
              style={[styles.section, { marginHorizontal: 0, marginTop: 16 }]}
            >
              <Text style={styles.sectionTitle}>Cấu trúc môn học</Text>
              {leftNodes.length > 0 && rightNodes.length > 0 ? (
                <>
                  <View style={styles.diagramContainer}>
                    <Svg style={styles.svgLayer}>
                      {mappings.map((m, i) => {
                        const y1 = positions[m.from];
                        const y2 = positions[m.to];
                        if (y1 !== undefined && y2 !== undefined)
                          return (
                            <Line
                              key={i}
                              x1="25%"
                              y1={y1}
                              x2="75%"
                              y2={y2}
                              stroke={getColorByLevel(m.level)}
                              strokeWidth="2"
                              strokeOpacity={0.6}
                            />
                          );
                        return null;
                      })}
                    </Svg>
                    <View style={styles.column}>
                      <Text style={styles.colTitle}>Môn Gốc</Text>
                      {leftNodes.map(n => (
                        <View
                          key={n.id}
                          style={[styles.node, styles.ploNode]}
                          onLayout={e =>
                            updatePosition(
                              n.id,
                              e.nativeEvent.layout.y,
                              e.nativeEvent.layout.height,
                            )
                          }
                        >
                          <Text style={styles.nodeTitle}>{n.code}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={styles.column}>
                      <Text style={styles.colTitle}>Môn Điều Kiện</Text>
                      {rightNodes.map(n => (
                        <View
                          key={n.id}
                          style={[styles.node, styles.cloNode]}
                          onLayout={e =>
                            updatePosition(
                              n.id,
                              e.nativeEvent.layout.y,
                              e.nativeEvent.layout.height,
                            )
                          }
                        >
                          <Text style={styles.nodeTitle}>{n.code}</Text>
                          <Text style={styles.nodeDesc} numberOfLines={1}>
                            {n.desc}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      gap: 10,
                      marginTop: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        color: '#ef4444',
                        fontWeight: '600',
                      }}
                    >
                      ● Tiên quyết
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        color: '#3b82f6',
                        fontWeight: '600',
                      }}
                    >
                      ● Song hành
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        color: '#eab308',
                        fontWeight: '600',
                      }}
                    >
                      ● Tương đương
                    </Text>
                  </View>
                </>
              ) : (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Icon name="link-variant-off" size={40} color="#CBD5E1" />
                  <Text style={{ marginTop: 8, color: '#64748B' }}>
                    Không có môn học liên quan
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {plans.length > 0 && (
          <Section title="Kế hoạch giảng dạy">
            {plans
              .sort((a, b) => a.weekNo - b.weekNo)
              .map((item, index) => (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={styles.timelineDot}>
                      <Text style={styles.weekNum}>{item.weekNo}</Text>
                    </View>
                    {index < plans.length - 1 && (
                      <View style={styles.timelineLine} />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.topic}>{item.topic}</Text>
                    <Text style={styles.method}>PP: {item.teachingMethod}</Text>
                  </View>
                </View>
              ))}
          </Section>
        )}

        {assessments.length > 0 && (
          <Section title="Đánh giá & Điểm số">
            {assessments.map((item, index) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: '#F1F5F9',
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flex: 1,
                  }}
                >
                  <Icon
                    name="clipboard-check-outline"
                    size={18}
                    color="#64748B"
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{
                      color: '#334155',
                      fontWeight: '600',
                      fontSize: 14,
                    }}
                  >
                    {item.name}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: '#DBEAFE',
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      fontWeight: '800',
                      color: '#2563EB',
                      fontSize: 14,
                    }}
                  >
                    {item.weightPercent}%
                  </Text>
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
                  <Text style={styles.bulletSubtitle}>
                    {item.author} ({item.materialType})
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleReport(item)}
                    style={styles.reportBtn}
                  >
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <Icon
                        name="flag-outline"
                        size={14}
                        color="#EF4444"
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.reportText}>Báo lỗi</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </Section>
        )}
      </ScrollView>

      <Modal
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        animationType="fade"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalView}>
            <Icon
              name="alert-circle-outline"
              size={48}
              color="#EF4444"
              style={{ alignSelf: 'center', marginBottom: 10 }}
            />
            <Text style={styles.modalTitle}>Báo cáo tài liệu</Text>
            <Text style={styles.modalSubtitle}>{selectedMaterial?.title}</Text>

            <TextInput
              style={styles.input}
              placeholder="Mô tả chi tiết vấn đề..."
              placeholderTextColor="#94A3B8"
              multiline
              value={customReason}
              onChangeText={setCustomReason}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.buttonCancel]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.textCancel}>Hủy bỏ</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.buttonConfirm]}
                onPress={handleSubmitCustomReason}
                disabled={isSendingReport} // Disable khi đang gửi
              >
                {isSendingReport ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.textConfirm}>Gửi báo cáo</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
