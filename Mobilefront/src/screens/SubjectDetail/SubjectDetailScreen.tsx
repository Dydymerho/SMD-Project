import styles from "./SubjectDetailScreen.styles"
import type React from "react"
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native"
import { type RouteProp, useRoute } from "@react-navigation/native"
import { SYLLABUS_CONTENT } from "../../mock/Syllabus"

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
            <View style={styles.header}>
                <Text style={styles.title}>{syllabus.code}</Text>
                <Text style={styles.subtitle}>{name || syllabus.name}</Text>

                <View style={styles.headerActions}>
                    <ActionTag label="Theo dõi" onPress={() => Alert.alert("Đã theo dõi")} />
                    <ActionTag label="Thông báo" />
                </View>
            </View>

            {/* ===== COURSE DESCRIPTION ===== */}
            <Section title="Mô tả khóa học">
                <Text style={styles.bullet}>{syllabus.description || syllabus.content}</Text>
            </Section>

            {/* ===== COURSE INFO ===== */}
            <Section title="Thông tin khóa học">
                <InfoRow label="Khoa" value={syllabus.department} />
                <InfoRow label="Tín chỉ" value={String(syllabus.credits)} />
            </Section>

            {/* ===== AI SUMMARY ===== */}
            <Section title="AI Summary">
                <Text style={styles.bullet}>{syllabus.aiSummary}</Text>
            </Section>

            {/* ===== CLO LIST ===== */}
            <Section title="Chuẩn đầu ra khóa học (CLOs)">
                {syllabus.clos?.map((clo, index) => (
                    <Bullet key={index} text={clo} />
                ))}
            </Section>

            {/* ===== CLO → PLO ===== */}
            <Section title="Liên kết CLO → PLO">
                {syllabus.cloPloLinks?.map((item, index) => (
                    <Text key={index} style={styles.mapping}>
                        {item.clo} → {item.plos.join(", ")}
                    </Text>
                ))}
            </Section>

            {/* ===== SUBJECT RELATIONSHIP ===== */}
            <Section title="Cây quan hệ môn học">
                <Text style={styles.treeTitle}>Môn tiên quyết</Text>
                {Array.isArray(syllabus.prerequisites) && syllabus.prerequisites.length > 0 ? (
                    syllabus.prerequisites.map((code: string) => (
                        <TouchableOpacity key={code}>
                            <Text style={styles.linkText}>• {code}</Text>
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text style={styles.linkText}>Không có</Text>
                )}
            </Section>

            {/* ===== TEACHING PLAN ===== */}
            {syllabus.teachingPlan && (
                <Section title="Kế hoạch giảng dạy">
                    {syllabus.teachingPlan.map((item, index) => (
                        <View key={index} style={styles.teachingPlanRow}>
                            <Text style={styles.week}>Tuần {item.week}</Text>
                            <Text style={styles.topic}>{item.topic}</Text>
                            <Text style={styles.method}>{item.method}</Text>
                        </View>
                    ))}
                </Section>
            )}

            {/* ===== ASSESSMENT ===== */}
            {syllabus.assessments && (
                <Section title="Phương pháp đánh giá">
                    {syllabus.assessments.map((item, index) => (
                        <Text key={index} style={styles.bullet}>
                            • {item.type}: {item.weight}%
                        </Text>
                    ))}
                </Section>
            )}

            {/* ===== MATERIALS ===== */}
            {syllabus.materials && (
                <Section title="Tài liệu học tập">
                    {syllabus.materials.map((item, index) => (
                        <Text key={index} style={styles.bullet}>
                            • {item.name} – {item.author} ({item.type})
                        </Text>
                    ))}
                </Section>
            )}

            {/* ===== REPORT ===== */}
            <TouchableOpacity style={styles.reportBtn}>
                <Text style={styles.reportText}>⚠ Báo cáo vấn đề</Text>
            </TouchableOpacity>
        </ScrollView>
    )
}
