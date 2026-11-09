// Temporary fake data. Replace with Firestore calls when the backend is ready.
export const dashboardStats = {
    pending: 12,
    completedToday: 8,
    issuesFound: 5,
    rejected: 1,
};

export const recentActivity = [
    { id: 'INS-0031', status: 'completed', timeAgo: '3 minutes ago' },
    { id: 'INS-0029', status: 'rejected', timeAgo: '28 minutes ago' },
    { id: 'INS-0028', status: 'completed', timeAgo: '1 hour ago' },
];

// status: 'pending' | 'issues'
export const pendingInspections = [
    {
        inspectionId: 'INS-0032',
        staffName: 'Nimal Perera',
        productName: 'Wireless Headphones',
        expectedQuantity: 20,
        staffReportedQuantity: 18,
        submittedAt: 'Today, 2:30 PM',
        status: 'pending',
        icon: 'headset',
    },
    {
        inspectionId: 'INS-0031',
        staffName: 'Sahan Wijesinghe',
        productName: 'Office Chair',
        expectedQuantity: 15,
        staffReportedQuantity: 15,
        submittedAt: 'Today, 11:15 AM',
        status: 'pending',
        icon: 'cube',
    },
    {
        inspectionId: 'INS-0030',
        staffName: 'Dilini Fernando',
        productName: 'Cardboard Box',
        expectedQuantity: 50,
        staffReportedQuantity: 45,
        submittedAt: 'Yesterday, 4:20 PM',
        status: 'issues',
        icon: 'cube',
    },
];