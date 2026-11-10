
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import NewInspection from './NewInspection';
import PhotoEvidence from './PhotoEvidence';
import InspectionHistory from './InspectionHistory';

export default function StaffDashboard() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');

  const [inspectionData, setInspectionData] = useState(null);
  const [photoEvidenceData, setPhotoEvidenceData] = useState(null);

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
      />
    );
  }

  // Screen 4: Inspection History
  if (currentScreen === 'history') {
    return (
      <InspectionHistory
        onBack={() => setCurrentScreen('dashboard')}
      />
    );
  }

  // Screen 1: Staff Dashboard
  const statistics = [
    { label: 'Total Inspected', value: '150', icon: '▦' },
    { label: 'Inspected Today', value: '12', icon: '✓' },
    { label: 'Damaged Items', value: '8', icon: '!' },
    { label: 'Missing Items', value: '5', icon: '?' },
  ];

  const recentInspections = [
    {
      id: 'INS-0032',
      time: 'Today, 2:30 PM',
      status: 'Completed',
    },
    {
      id: 'INS-0031',
      time: 'Today, 11:15 AM',
      status: 'Completed',
    },
    {
      id: 'INS-0030',
      time: 'Yesterday, 4:20 PM',
      status: 'Pending',
    },
  ];

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

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>PA</Text>
          </View>
        </View>

        {/* Welcome */}
        <Text style={styles.greeting}>
          Hello, Prarthana!
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
          {statistics.map((item) => (
            <View key={item.label} style={styles.statCard}>
              <Text style={styles.statIcon}>
                {item.icon}
              </Text>

              <Text style={styles.statValue}>
                {item.value}
              </Text>

              <Text style={styles.statLabel}>
                {item.label}
              </Text>
            </View>
          ))}
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

        {/* Recent Inspections */}
        <Text style={styles.sectionTitle}>
          Recent Inspections
        </Text>

        {recentInspections.map((item) => (
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
                item.status === 'Completed'
                  ? styles.completed
                  : styles.pending
              }
            >
              {item.status}
            </Text>
          </View>
        ))}
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

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: '#14532D',
    fontSize: 16,
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

  statIcon: {
    fontSize: 22,
    color: '#15803D',
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
});
