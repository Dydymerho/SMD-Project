import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './styles';
import { MOCK_PROFILE } from '../../mock/profile';


const Section = ({
    title,
    children
}: {
    title?: string
    children: React.ReactNode
}) => (
    <View style={styles.section}>
        {title && <Text style={styles.sectionTitle}>{title}</Text>}
        {children}
    </View>
)

const InfoRow = ({
    label,
    value,
    iconName
}: {
    label: string
    value?: string
    iconName: string
}) => (
    <View style={styles.infoRow}>
        <View style={styles.iconBox}>
            <Icon name={iconName} size={20} color="#3b82f6" />
        </View>
        <View>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value || '—'}</Text>
        </View>
    </View>
)

const Bullet = ({ text, code }: { text: string; code: string }) => (
    <TouchableOpacity style={styles.bullet} activeOpacity={0.8}>
        <View style={styles.bulletIcon}>
            <Icon name="book-open-page-variant" size={18} color="#3b82f6" />
        </View>
        <View>
            <Text style={styles.bulletText}>{text}</Text>
        </View>
    </TouchableOpacity>
)

const BottomNavItem = ({
    label,
    iconName,
    active
}: {
    label: string
    iconName: string
    active?: boolean
}) => (
    <TouchableOpacity style={styles.navItem}>
        <Icon
            name={iconName}
            size={24}
            color={active ? '#3b82f6' : '#94a3b8'}
        />
        <Text style={[styles.navText, active && styles.navTextActive]}>
            {label}
        </Text>
    </TouchableOpacity>
)

/* =====================
        SCREEN
===================== */

export default function ProfileScreen() {
    const profile = MOCK_PROFILE;

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* HERO */}
                <View style={styles.heroCard}>
                    <Image
                        source={{ uri: profile.avatarUrl }}
                        style={styles.avatar}
                    />
                    <Text style={styles.userName}>{profile.name}</Text>
                    <Text style={styles.userRole}>Sinh viên khóa 2024</Text>
                </View>

                {/* PROFILE INFO */}
                <Section title="Thông tin hồ sơ">
                    <InfoRow
                        iconName="email-outline"
                        label="Địa chỉ Email"
                        value={profile.email}
                    />
                    <InfoRow
                        iconName="earth"
                        label="Quốc gia"
                        value={profile.country}
                    />
                    <InfoRow
                        iconName="clock-outline"
                        label="Múi giờ"
                        value={profile.timezone}
                    />
                </Section>

                {/* COURSES */}
                <Section title="Các khóa học">
                    {profile.subjectdetails?.map((subject, index) => (
                        <Bullet
                            key={index}
                            code={subject.code}
                            text={subject.title}
                        />
                    ))}
                </Section>
            </ScrollView>
        </View>
    );
}
