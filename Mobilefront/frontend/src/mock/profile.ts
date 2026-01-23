export interface Profile {
    id: string
    name: string
    email: string
    country?: string
    timezone?: string
    avatarUrl?: string
    subjectdetails?: Array<{
        code: string
        title: string
    }>
}

export const MOCK_PROFILE: Profile = {
    id: 'user-123',
    name: 'Nguyễn Văn A',
    email: 'nguyenvanA@gmail.com',
    country: 'Việt Nam',
    timezone: 'GMT+7',
    avatarUrl: 'https://randomuser.me/api/portraits/men/75.jpg',
    subjectdetails: [
        { code: 'MATH101', title: 'Toán Cao Cấp' },
        { code: 'PHYS101', title: 'Vật Lý Đại Cương' },
        { code: 'CS101', title: 'Nhập Môn Lập Trình' },
    ],
}