import styles from "./SubjectDetailScreen.styles"
import type React from "react"
import { View, Text, ScrollView, TouchableOpacity, Alert, } from "react-native"
import { type RouteProp, useRoute } from "@react-navigation/native"
import { SYLLABUS_CONTENT } from "../../mock/Syllabus"
import LinearGradient from "react-native-linear-gradient"
/* ===== TYPES ===== */

type RouteParams = {
    SubjectDetail: {
        code: string
        name?: string
    }
}

/* ===== SMALL COMPONENTS ===== */

const ActionTag = ({ label, onPress }: { label: string; onPress?: () => void }) => (
    <TouchableOpacity style={styles.tag} onPress={onPress}>
        <Text style={styles.tagText}>{label}</Text>
    </TouchableOpacity>
)
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
    </View>
)

const InfoRow = ({ label, value }: { label: string; value?: string }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || "—"}</Text>
    </View>
)

const Bullet = ({ text }: { text: string }) => <Text style={styles.bullet}>• {text}</Text>

/* ===== SCREEN ===== */

export default function SubjectDetailScreen() {
    const route = useRoute<RouteProp<RouteParams, "SubjectDetail">>()
    const { code, name } = route.params

    const syllabus = SYLLABUS_CONTENT.find((item) => item.code === code)

    if (!syllabus) {
        return (
            <View style={styles.container}>
                <Text>Không tìm thấy thông tin môn học</Text>
            </View>
        )
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* ===== HEADER ===== */}
            <LinearGradient
                colors={["#4F1CFF", "#2D5BFF"]}
                style={styles.header}>
                <Text style={styles.code}>{syllabus.code}</Text>
                <Text style={styles.title}>{syllabus.name}</Text>
                <Text style={styles.subtitle}>{syllabus.department}</Text>
            </LinearGradient>
            {/* <View style={styles.headerActions}>
                    <ActionTag label="Theo dõi" onPress={() => Alert.alert("Đã theo dõi")} />
                    <ActionTag label="Thông báo" />
                </View> */}
            {/* ===== COURSE DESCRIPTION ===== */}
            <Section title="Mô tả tóm tắt học phần">
                <Text style={styles.bullet}>{syllabus.aiSummary}</Text>
            </Section>
            {/* ===== COURSE INFO ===== */}
            <Section title="Thông tin khóa học">
                <InfoRow label="Khoa" value={syllabus.department} />
                <InfoRow label="Người đăng" value={syllabus.author} />
                <InfoRow label="Tín chỉ" value={String(syllabus.credits)} />
                <InfoRow label="Loại học phần" value={syllabus.type} />
                <InfoRow label="Phiên bản" value={String(syllabus.version)} />
                <InfoRow label="Ngày xuất bản" value={syllabus.datePublished} />
            </Section>
            <Section title="Mục tiêu học phần">
                {syllabus.target?.map((item, index) => (
                    <View key={index} style={styles.outcomeItem}>
                        <View style={styles.outcomeBadge}>
                            <Text style={styles.outcomeBadgeText}>
                                CO {index + 1}
                            </Text>
                        </View>

                        <Text style={styles.outcomeText}>
                            {item}
                        </Text>
                    </View>
                ))}
            </Section>
            <Section title="Chuẩn đầu ra khóa học">
                {syllabus.clos?.map((item, index) => (
                    <View key={index} style={styles.outcomeItem}>
                        <View style={styles.outcomeBadge}>
                            <Text style={styles.outcomeBadgeText}>
                                CL{index + 1}
                            </Text>
                        </View>

                        <Text style={styles.outcomeText}>
                            {item}
                        </Text>
                    </View>
                ))}
            </Section>
            {/* ===== SUBJECT RELATIONSHIP ===== */}
            <Section title="Liên hệ giữa CĐR học phần và CĐR CTĐ">
                {syllabus.cloPloLinks?.map((item, index) => (
                    <View key={index} style={styles.cloCard}>
                        <Text style={styles.cloTitle}>{item.clo}</Text>

                        <View style={styles.ploRow}>
                            {item.plos.map((plo) => (
                                <View key={plo} style={styles.ploBadge}>
                                    <Text style={styles.ploText}>{plo} ✓</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}
            </Section>
            {
                syllabus.studentmission && (
                    <Section title="Nhiệm vụ của sinh viên">
                        {syllabus.studentmission.map((item, index) => (
                            <View key={index} style={styles.teachingPlanRow}>
                                <Text style={styles.missions}>{item}</Text>
                            </View>
                        ))}
                    </Section>
                )
            }
            {/* ===== TEACHING PLAN ===== */}
            {
                syllabus.teachingPlan && (
                    <Section title="Kế hoạch giảng dạy">
                        {syllabus.teachingPlan.map((item, index) => (
                            <View key={index} style={styles.teachingPlanRow}>
                                <Text style={styles.week}>Tuần {item.week}</Text>
                                <Text style={styles.topic}>{item.topic}</Text>
                                <Text style={styles.method}>{item.method}</Text>
                            </View>
                        ))}
                    </Section>
                )
            }
            {/*STUDENT MISSIONS*/}
            {/* ===== ASSESSMENT ===== */}
            {
                syllabus.assessments && (
                    <Section title="Phương thức kiểm tra và đánh giá">
                        {syllabus.assessments.map((item, index) => (
                            <Text key={index} style={styles.bullet}>
                                {item.type}: {item.weight}%
                            </Text>
                        ))}
                    </Section>
                )
            }

            {/* ===== MATERIALS ===== */}
            {
                syllabus.materials && (
                    <Section title="Tài liệu học tập">
                        {syllabus.materials.map((item, index) => (
                            <Text key={index} style={styles.bullet}>
                                {`[${index + 1}]`} {item.name} – {item.author} ({item.type})
                            </Text>
                        ))}
                    </Section>
                )
            }
            {/* ===== REPORT ===== */}
            <TouchableOpacity style={styles.reportBtn}>
                <Text style={styles.reportText}>Báo cáo vấn đề</Text>
            </TouchableOpacity>
        </ScrollView >
    )
}
