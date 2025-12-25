import styles from './styles'
import React from 'react'
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,

} from 'react-native'
import { RouteProp, useRoute } from '@react-navigation/native'

/* ===== PROPS ===== */

interface ActionTagProps {
    label: string
    onPress?: () => void
}

interface SectionProps {
    title: string
    children: React.ReactNode
}

interface InfoRowProps {
    label: string
    value: string
}

interface BulletProps {
    text: string
}

type RouteParams = {
    SubjectDetail: {
        code: string
        name: string
    }
}
/* ===== SMALL COMPONENTS ===== */

const ActionTag: React.FC<ActionTagProps> = ({ label, onPress }) => (
    <TouchableOpacity style={styles.tag} onPress={onPress}>
        <Text style={styles.tagText}>{label}</Text>
    </TouchableOpacity>
)

const Section: React.FC<SectionProps> = ({ title, children }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
    </View>
)

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
    </View>
)

const Bullet: React.FC<BulletProps> = ({ text }) => (
    <Text style={styles.bullet}>• {text}</Text>
)

/* ===== SCREEN ===== */

export default function SubjectDetailScreen() {
    const route = useRoute<RouteProp<RouteParams, 'SubjectDetail'>>()
    const { code, name } = route.params;
    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 40 }}
        >
            {/* HEADER */}
            <View style={styles.header}>
                <Text style={styles.title}>{code}</Text>
                <Text style={styles.subtitle}>{name}</Text>

                <View style={styles.headerActions}>
                    <ActionTag label="Theo dõi" onPress={() => Alert.alert('đã theo dõi')} />
                    <ActionTag label="Thông báo" />
                </View>
            </View>

            {/* AI SUMMARY */}
            <Section title="AI Summary">
                <Text style={styles.paragraph}>
                    Khóa học cung cấp kiến thức nền tảng về phát triển
                    phần mềm, quy trình SE, UML và các phương pháp
                    quản lý dự án phần mềm.
                </Text>
            </Section>

            {/* COURSE INFO */}
            <Section title="Thông tin khóa học">
                <InfoRow label="Tín chỉ" value="3" />
                <InfoRow label="Môn học cần hoàn thành trước đó" value="None" />
            </Section>

            {/* CLO LIST */}
            <Section title="Chuẩn đầu ra khóa học (CLOs)">
                <Bullet text="CLO1 – Hiểu quy trình Software Engineering" />
                <Bullet text="CLO2 – Áp dụng UML trong phân tích & thiết kế" />
            </Section>

            {/* CLO → PLO */}
            <Section title="Liên kết CLO → PLO">
                <Text style={styles.mapping}>
                    CLO1 → PLO1, PLO3
                </Text>
            </Section>

            {/* SUBJECT RELATIONSHIP */}
            <Section title="Subject Relationship">
                <TouchableOpacity style={styles.linkBtn}>
                    <Text style={styles.linkText}>View Tree →</Text>
                </TouchableOpacity>
            </Section>

            {/* REPORT */}
            <TouchableOpacity style={styles.reportBtn}>
                <Text style={styles.reportText}>🚨 Report an issue</Text>
            </TouchableOpacity>
        </ScrollView>
    )
}
