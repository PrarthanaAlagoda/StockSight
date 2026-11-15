
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';

import {
  ClipboardList,
  CalendarCheck,
  PackageX,
  PackageMinus,
} from 'lucide-react-native';

import NewInspection from './NewInspection';
import PhotoEvidence from './PhotoEvidence';
import InspectionHistory from './InspectionHistory';

import { getStaffDashboardData } from './staffService';

export default function StaffDashboard({ onLogout, employee }) {
  const [currentScreen, setCurrentScreen] = useState('dashboard');

  const [inspectionData, setInspectionData] = useState(null);
  const [photoEvidenceData, setPhotoEvidenceData] = useState(null);

  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  // Fetch dashboard data from Firestore
  useEffect(() => {
    let isActive = true;

    const fetchDashboardData = async () => {
      if (!employee?.employee_id) {
        setDashboardLoading(false);
        return;
      }

      try {
        setDashboardLoading(true);

        const data = await getStaffDashboardData(
          employee.employee_id
        );

        if (isActive) {
          setDashboardData(data);
        }
      } catch (error) {
        console.error('Dashboard loading failed:', error);

        if (isActive) {
          Alert.alert(
            'Dashboard Error',
            'Unable to load your inspection data from Firestore.'
          );
        }
      } finally {
        if (isActive) {
          setDashboardLoading(false);
        }
      }
    };

    if (currentScreen === 'dashboard') {
      fetchDashboardData();
    }

    return () => {
      isActive = false;
    };
  }, [employee?.employee_id, currentScreen]);

  // Screen 2: New Inspection
  if (currentScreen === 'newInspection') {
    return (
      <NewInspection
        onBack={() => setCurrentScreen('dashboard')}
        onContinue={(data) => {
          setInspectionData(data);
          setCurrentScreen('photoEvidence');
        }}
      />
    );
  }

  // Screen 3: Photo Evidence
  if (currentScreen === 'photoEvidence') {
    return (
      <PhotoEvidence
        onBack={() => setCurrentScreen('newInspection')}
        onContinue={(data) => {
          setPhotoEvidenceData(data);
          setCurrentScreen('history');
        }}
        inspectionData={inspectionData}
        employee={employee}
      />
    );
  }

  // Screen 4: Inspection History
  if (currentScreen === 'history') {
    return (
      <InspectionHistory
        onBack={() => setCurrentScreen('dashboard')}
        employeeId={employee?.employee_id}
      />
    );
  }

  // Dashboard statistics from Firestore
  const statistics = [
    {
      label: 'Total Inspected',
      value: dashboardLoading
        ? '...'
        : String(dashboardData?.totalInspected ?? 0),
      Icon: ClipboardList,
      iconColor: '#15803D',
      iconBackground: '#F0FDF4',
    },
    {
      label: 'Inspected Today',
      value: dashboardLoading
        ? '...'
        : String(dashboardData?.inspectedToday ?? 0),
      Icon: CalendarCheck,
      iconColor: '#15803D',
      iconBackground: '#F0FDF4',
    },
    {
      label: 'Damaged Items',
      value: dashboardLoading
        ? '...'
        : String(dashboardData?.damagedItems ?? 0),
      Icon: PackageX,
      iconColor: '#DC2626',
      iconBackground: '#FEF2F2',
    },
    {
      label: 'Missing Items',
      value: dashboardLoading
        ? '...'
        : String(dashboardData?.missingItems ?? 0),
      Icon: PackageMinus,
      iconColor: '#EA580C',
      iconBackground: '#FFF7ED',
    },
  ];

  // Recent inspections from Firestore
  const recentInspections =
    dashboardData?.recentInspections?.map((inspection) => {
      const submittedAt = inspection.submitted_at?.toDate?.();

      return {
        id:
          inspection.inspection_number ||
          `INS-${(inspection.inspection_id || inspection.id)
            .slice(0, 6)
            .toUpperCase()}`,
        time: submittedAt
          ? submittedAt.toLocaleString()
          : 'Date unavailable',
        status: inspection.status || 'Pending',
      };
    }) || [];

  // Logout confirmation
  const confirmLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: onLogout,
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>StockSight</Text>
            <Text style={styles.subtitle}>
              Warehouse Inspector
            </Text>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={confirmLogout}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Welcome */}
        <Text style={styles.greeting}>
          Hello, {employee?.name || 'Staff'}!
        </Text>

        <Text style={styles.description}>
          Let's keep your warehouse in check.
        </Text>

        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>
            Smart Inventory Inspection
          </Text>

          <Text style={styles.bannerText}>
            Inspect. Capture. Report.
          </Text>
        </View>

        {/* Statistics */}
        <Text style={styles.sectionTitle}>
          Inspection Overview
        </Text>

        <View style={styles.grid}>
          {statistics.map((item) => {
            const IconComponent = item.Icon;

            return (
              <View key={item.label} style={styles.statCard}>
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: item.iconBackground },
                  ]}
                >
                  <IconComponent
                    size={25}
                    color={item.iconColor}
                    strokeWidth={2.2}
                  />
                </View>

                <Text style={styles.statValue}>
                  {item.value}
                </Text>

                <Text style={styles.statLabel}>
                  {item.label}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Start Inspection */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setCurrentScreen('newInspection')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            + Start New Inspection
          </Text>
        </TouchableOpacity>

        {/* Inspection History */}
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => setCurrentScreen('history')}
          activeOpacity={0.8}
        >
          <Text style={styles.historyButtonText}>
            View Inspection History →
          </Text>
        </TouchableOpacity>

        {/* Recent Inspections */}
        <Text style={styles.sectionTitle}>
          Recent Inspections
        </Text>

        {dashboardLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#166534" />
            <Text style={styles.emptyText}>
              Loading inspections...
            </Text>
          </View>
        ) : recentInspections.length === 0 ? (
          <Text style={styles.emptyText}>
            No inspections found.
          </Text>
        ) : (
          recentInspections.map((item) => (
            <View key={item.id} style={styles.recentCard}>
              <View>
                <Text style={styles.inspectionId}>
                  {item.id}
                </Text>

                <Text style={styles.recentDetails}>
                  {item.time}
                </Text>
              </View>

              <Text
                style={
                  ['COMPLETED', 'APPROVED'].includes(
                    item.status?.toUpperCase()
                  )
                    ? styles.completed
                    : styles.pending
                }
              >
                {item.status}
              </Text>
            </View>
          ))
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F7F3',
  },

  content: {
    padding: 20,
    paddingTop: 55,
    paddingBottom: 32,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },

  logo: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#14532D',
  },

  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 3,
  },

  logoutButton: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },

  logoutText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: 'bold',
  },

  greeting: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#163B29',
  },

  description: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 6,
    marginBottom: 20,
  },

  banner: {
    backgroundColor: '#14532D',
    padding: 22,
    borderRadius: 18,
    marginBottom: 24,
  },

  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: 'bold',
  },

  bannerText: {
    color: '#DCFCE7',
    fontSize: 14,
    marginTop: 10,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#163B29',
    marginBottom: 14,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E1EDE3',
  },

  statIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#14532D',
    marginTop: 8,
  },

  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 5,
  },

  primaryButton: {
    backgroundColor: '#166534',
    padding: 17,
    borderRadius: 13,
    alignItems: 'center',
    marginBottom: 28,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  recentCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 13,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  inspectionId: {
    color: '#163B29',
    fontWeight: 'bold',
    fontSize: 15,
  },

  recentDetails: {
    color: '#64748B',
    marginTop: 5,
    fontSize: 12,
  },

  completed: {
    color: '#166534',
    backgroundColor: '#DCFCE7',
    padding: 7,
    borderRadius: 8,
    overflow: 'hidden',
    fontSize: 11,
  },

  pending: {
    color: '#92400E',
    backgroundColor: '#FEF3C7',
    padding: 7,
    borderRadius: 8,
    overflow: 'hidden',
    fontSize: 11,
  },

  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },

  emptyText: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    padding: 15,
  },

  historyButton: {
    backgroundColor: '#FFFFFF',
    padding: 17,
    borderRadius: 13,
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1.5,
    borderColor: '#166534',
  },

  historyButtonText: {
    color: '#166534',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
