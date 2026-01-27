import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import styles from "./SubjectDetailScreen.styles";
import { SubjectService } from "../../../../backend/Service/SubjectService";
import { SubjectDetailData } from "../../../../backend/types/SubjectDetail";

type RouteParams = {
    SubjectDetail: {
        code: string;
        name?: string;
    }
};

/* --- Component con để code gọn hơn --- */
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

export default function SubjectDetailScreen() {
    const route = useRoute<RouteProp<RouteParams, "SubjectDetail">>();
    const navigation = useNavigation();
    const { code } = route.params;

    const [data, setData] = useState<SubjectDetailData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await SubjectService.getFullDetail(code);

                if (result) {
                    setData(result);
                } else {
                    Alert.alert("Thông báo", `Không tìm thấy dữ liệu cho môn: ${code}`);
                }
            } catch (error) {
                console.error(error);
                Alert.alert("Lỗi", "Không thể tải dữ liệu. Vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [code]);

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
                <Text style={{ marginBottom: 10 }}>Không có dữ liệu</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={{ color: '#4F1CFF' }}>Quay lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const { info, plans, assessments, materials } = data;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Header */}
            <LinearGradient colors={["#4F1CFF", "#2D5BFF"]} style={styles.header}>
                <Text style={styles.code}>{info.courseCode}</Text>
                <Text style={styles.title}>{info.courseName}</Text>
                <Text style={styles.subtitle}>{info.deptName}</Text>
            </LinearGradient>

            {/* Mô tả AI */}
            <Section title="Mô tả tóm tắt">
                <Text style={styles.missionText}>{info.aiSumary}</Text>
            </Section>

            {/* Thông tin chung */}
            <Section title="Thông tin chi tiết">
                <InfoRow label="Giảng viên" value={info.lecturerName} />
                <InfoRow label="Tín chỉ" value={info.credit} />
                <InfoRow label="Năm học" value={info.academicYear} />
                <InfoRow label="Loại hình" value={info.type} />
            </Section>

            {/* Mục tiêu (Targets) */}
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

            {/* Chuẩn đầu ra (CLOs) */}
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

            {/* Tài liệu */}
            {materials.length > 0 && (
                <Section title="Tài liệu tham khảo">
                    {materials.map((item, index) => (
                        <View key={index} style={{ marginBottom: 10 }}>
                            <Text style={styles.bullet}>
                                [{index + 1}] <Text style={{ fontWeight: '600' }}>{item.title}</Text>
                            </Text>
                            <Text style={[styles.subtitle, { color: '#666', marginLeft: 15 }]}>
                                {item.author} ({item.materialType})
                            </Text>
                        </View>
                    ))}
                </Section>
            )}
        </ScrollView>
    );
}