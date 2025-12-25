import { StyleSheet } from 'react-native';
import { SearchBar } from 'react-native-screens';
import { Icon } from 'react-native-vector-icons/Icon';

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#F6F7FB',
    },

    header: {
        backgroundColor: '#2D5BFF',
        paddingHorizontal: 20,
        paddingBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
    },

    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },

    headerIcons: {
        flexDirection: 'row',
        gap: 12,
    },

    icon: {
        fontSize: 30,
        color: '#999',
    },

    container: {
        padding: 20,
    },

    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12,
        marginVertical: 12,
        borderWidth: 1,
        borderColor: '#eee',
    },
    SearchBar: {
        flex: 1,
        paddingRight: 8,
    },

    greeting: {
        fontSize: 30,
        fontWeight: '700',
        marginTop: 8,
    },

    subText: {
        color: '#666',
        marginBottom: 16,
        fontSize: 16,
    },

    section: {
        marginBottom: 24,
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },

    card: {
        backgroundColor: '#fff',
        borderRadius: 14,
        paddingVertical: 8,
    },

    courseItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },

    courseCode: {
        fontWeight: '700',
        marginRight: 12,
        color: '#2D5BFF',
        width: 60,
    },

    courseName: {
        fontSize: 16,
        color: '#333',
    },
});

export default styles;
