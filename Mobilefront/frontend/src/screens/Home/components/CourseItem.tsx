import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Subject } from '../../../mock/Subject';

interface CourseItemProps {
    course: Subject
}

export default function CourseItem({ course }: CourseItemProps) {
    const navigation = useNavigation<any>();

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() =>
                navigation.navigate('SubjectDetail', {
                    code: course.code,
                    name: course.name,
                    // Có thể truyền thêm các thông tin khác
                    course: course,
                })
            }
        >
            <View style={styles.header}>
                <Text style={styles.code}>{course.code}</Text>
                <Text style={styles.credits}>{course.credits} tín chỉ</Text>
            </View>
            <Text style={styles.name}>{course.name}</Text>
            <Text style={styles.meta}>
                {course.major} • {course.semester} • Năm {course.year}
            </Text>
            {course.prerequisite && course.prerequisite !== 'None' && (
                <Text style={styles.prerequisite}>
                    Tiên quyết: {course.prerequisite}
                </Text>
            )}
            <Text style={styles.summary} numberOfLines={2}>
                {course.summary}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        marginBottom: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    code: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    credits: {
        fontSize: 14,
        color: '#666666',
    },
    name: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 8,
    },
    meta: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 8,
    },
    prerequisite: {
        fontSize: 14,
        color: '#FF9500',
        fontStyle: 'italic',
        marginBottom: 8,
    },
    summary: {
        fontSize: 14,
        color: '#555555',
        lineHeight: 20,
    },
});