
import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';

import { getInspectionHistory } from './staffService';
import { getDocuments } from '../../services/firestore';
import { COLLECTIONS } from '../../utils/constants';

const FILTERS = ['All', 'Completed', 'Pending', 'Issues'];

// ==========================================
// HELPER FUNCTIONS
// ==========================================

const formatDate = (timestamp) => {
  if (!timestamp) return 'Not submitted';

  const date = timestamp.toDate
    ? timestamp.toDate()
    : new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return 'Not available';
  }

  return date.toLocaleString();
};

const getDisplayStatus = (status) => {
  switch (status) {
    case 'PENDING_REVIEW':
    case 'UNDER_REVIEW':
    case 'PENDING':
      return 'Pending';

    case 'COMPLETED':
      return 'Completed';

    case 'REJECTED':
      return 'Issues';

    case 'DRAFT':
      return 'Draft';

    default:
      return status || 'Unknown';
  }
};

// ==========================================
// INSPECTION HISTORY SCREEN
// ==========================================

export default function InspectionHistory({ onBack, employeeId }) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedInspection, setSelectedInspection] = useState(null);

  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ==========================================
  // LOAD FIRESTORE DATA
  // ==========================================

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      if (!employeeId) {
        setError('Employee information is unavailable.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const [
          staffInspections,
          inventories,
          products,
          categories,
          sections,
          observations,
          images,
          analyses,
        ] = await Promise.all([
          getInspectionHistory(employeeId),
          getDocuments(COLLECTIONS.INVENTORY),
          getDocuments(COLLECTIONS.PRODUCT),
          getDocuments(COLLECTIONS.CATEGORY),
          getDocuments(COLLECTIONS.SHELF_SECTION),
          getDocuments(COLLECTIONS.OBSERVATION),
          getDocuments(COLLECTIONS.IMAGE),
          getDocuments(COLLECTIONS.ANALYSIS),
        ]);

        const mappedInspections = staffInspections.map((inspection) => {
          // Original Firestore document ID
          const documentId =
            inspection.inspection_id || inspection.id;

          // Find related inventory
          const inventory = inventories.find(
            (item) =>
              item.inventory_id === inspection.inventory_id ||
              item.id === inspection.inventory_id
          );

          // Find related product
          const product = products.find(
            (item) =>
              item.product_id === inventory?.product_id ||
              item.id === inventory?.product_id
          );

          // Find related category
          const category = categories.find(
            (item) =>
              item.category_id === product?.category_id ||
              item.id === product?.category_id
          );

          // Find shelf section
          const section = sections.find(
            (item) =>
              item.section_id === inspection.section_id ||
              item.id === inspection.section_id
          );

          // Find observations using original document ID
          const observationRecords = observations.filter(
            (item) => item.inspection_id === documentId
          );

          // Find images using original document ID
          const imageRecords = images.filter(
            (item) => item.inspection_id === documentId
          );

          // Find manager analysis using original document ID
          const analysis = analyses.find(
            (item) => item.inspection_id === documentId
          );

          const observationText = observationRecords
            .map((item) => item.description || '')
            .filter(Boolean)
            .join('\n');

          const verifiedQuantity =
            analysis?.verified_quantity !== undefined &&
            analysis?.verified_quantity !== null
              ? Number(analysis.verified_quantity)
              : null;

          const expectedQuantity = Number(
            inspection.expected_quantity || 0
          );

          // Friendly inspection reference
          const inspectionNumber =
            inspection.inspection_number ||
            `INS-${documentId.slice(0, 6).toUpperCase()}`;

          return {
            id: inspectionNumber,
            documentId,

            productId:
              product?.product_id ||
              inventory?.product_id ||
              'N/A',

            productName:
              product?.product_name ||
              'Product information unavailable',

            category:
              category?.category_name ||
              product?.category_name ||
              product?.category ||
              'Not available',

            expectedQty: expectedQuantity,
            actualQty: verifiedQuantity,

            location:
              section?.section_code ||
              section?.description ||
              'Not available',

            condition:
              observationText || 'No issues recorded',

            status: getDisplayStatus(inspection.status),

            date: formatDate(
              inspection.submitted_at || inspection.created_at
            ),

            observations: observationText,

            photos: imageRecords
              .map((item) => item.image_url)
              .filter(Boolean),

            difference:
              verifiedQuantity !== null
                ? verifiedQuantity - expectedQuantity
                : null,
          };
        });

        if (isMounted) {
          setInspections(mappedInspections);
        }
      } catch (err) {
        console.error('Error loading inspection history:', err);

        if (isMounted) {
          setError(
            'Unable to load inspection history. Please try again.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [employeeId]);

  // ==========================================
  // SEARCH AND FILTER
  // ==========================================

  const filteredInspections = inspections.filter((item) => {
    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      item.id.toLowerCase().includes(searchText) ||
      item.documentId.toLowerCase().includes(searchText) ||
      item.productId.toLowerCase().includes(searchText) ||
      item.productName.toLowerCase().includes(searchText);

    const matchesFilter =
      activeFilter === 'All' ||
      item.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  // ==========================================
  // STATUS STYLING
  // ==========================================

  const getStatusStyle = (status) => {
    if (status === 'Completed') {
      return styles.completedStatus;
    }

    if (status === 'Pending') {
      return styles.pendingStatus;
    }

    return styles.issueStatus;
  };

  // ==========================================
  // INSPECTION DETAILS SCREEN
  // ==========================================

  if (selectedInspection) {
    const item = selectedInspection;

    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Header />

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedInspection(null)}
          >
            <Text style={styles.backText}>
              {'‹  Back to History'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.pageTitle}>
            Inspection Details
          </Text>

          <Text style={styles.subtitle}>
            Full record of the selected inspection.
          </Text>

          <View style={styles.card}>
            <View style={styles.detailHeader}>
              <Text style={styles.inspectionId}>
                {item.id}
              </Text>

              <Text
                style={[
                  styles.status,
                  getStatusStyle(item.status),
                ]}
              >
                {item.status}
              </Text>
            </View>

            <Text style={styles.productName}>
              {item.productName}
            </Text>

            <Text style={styles.mutedText}>
              {item.productId}
            </Text>

            <Detail label="Category" value={item.category} />

            <Detail
              label="Inspection Date"
              value={item.date}
            />

            <Detail
              label="Warehouse Location"
              value={item.location}
            />

            <Detail
              label="Product Condition"
              value={item.condition}
            />

            <View style={styles.quantityRow}>
              <View style={styles.quantityBox}>
                <Text style={styles.quantityLabel}>
                  Expected
                </Text>

                <Text style={styles.quantityValue}>
                  {item.expectedQty}
                </Text>
              </View>

              <View style={styles.quantityBox}>
                <Text style={styles.quantityLabel}>
                  Verified
                </Text>

                <Text style={styles.quantityValue}>
                  {item.actualQty ?? 'Pending'}
                </Text>
              </View>

              <View style={styles.quantityBox}>
                <Text style={styles.quantityLabel}>
                  Difference
                </Text>

                <Text
                  style={[
                    styles.quantityValue,
                    item.difference !== null &&
                      item.difference !== 0 &&
                      styles.differenceWarning,
                  ]}
                >
                  {item.difference === null
                    ? 'Pending'
                    : item.difference > 0
                    ? `+${item.difference}`
                    : item.difference}
                </Text>
              </View>
            </View>
          </View>

          {/* OBSERVATIONS */}

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Observations
            </Text>

            <Text style={styles.observationText}>
              {item.observations ||
                'No observations recorded.'}
            </Text>
          </View>

          {/* PHOTO EVIDENCE */}

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Photo Evidence
            </Text>

            {item.photos.length === 0 ? (
              <Text style={styles.mutedText}>
                No photos are attached to this inspection.
              </Text>
            ) : (
              item.photos.map((photo, index) => (
                <Image
                  key={`${item.documentId}-photo-${index}`}
                  source={{ uri: photo }}
                  style={styles.historyPhoto}
                  resizeMode="cover"
                />
              ))
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ==========================================
  // INSPECTION HISTORY LIST SCREEN
  // ==========================================

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Header />

        {onBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
          >
            <Text style={styles.backText}>
              {'‹  Back to Dashboard'}
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.pageTitle}>
          Inspection History
        </Text>

        <Text style={styles.subtitle}>
          Search and review your warehouse inspections.
        </Text>

        {/* SEARCH */}

        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search inspection ID or product..."
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          returnKeyType="search"
        />

        {/* FILTERS */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                activeFilter === filter &&
                  styles.activeFilter,
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter &&
                    styles.activeFilterText,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* LOADING */}

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#166534"
          />
        ) : error ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              {error}
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.resultsText}>
              {filteredInspections.length} inspection
              {filteredInspections.length === 1 ? '' : 's'} found
            </Text>

            {/* EMPTY STATE */}

            {filteredInspections.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>
                  No inspections found
                </Text>

                <Text style={styles.mutedText}>
                  Try another search or select a different filter.
                </Text>
              </View>
            ) : (
              filteredInspections.map((item) => (
                <TouchableOpacity
                  key={item.documentId}
                  style={styles.historyCard}
                  onPress={() => setSelectedInspection(item)}
                  activeOpacity={0.75}
                >
                  <View style={styles.detailHeader}>
                    <Text style={styles.inspectionId}>
                      {item.id}
                    </Text>

                    <Text
                      style={[
                        styles.status,
                        getStatusStyle(item.status),
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>

                  <Text style={styles.cardProductName}>
                    {item.productName}
                  </Text>

                  <Text style={styles.mutedText}>
                    Product ID: {item.productId}
                  </Text>

                  <View style={styles.cardDivider} />

                  <View style={styles.cardBottom}>
                    <View>
                      <Text style={styles.quantityLabel}>
                        Verified Quantity
                      </Text>

                      <Text style={styles.quantityValue}>
                        {item.actualQty ?? 'Pending'}
                      </Text>
                    </View>

                    <View style={styles.dateContainer}>
                      <Text style={styles.dateText}>
                        {item.date}
                      </Text>

                      <Text style={styles.viewDetails}>
                        {'View details  →'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ==========================================
// HEADER COMPONENT
// ==========================================

function Header() {
  return (
    <View style={styles.header}>
      <View style={styles.logoBox}>
        <Text style={styles.logoLetter}>S</Text>
      </View>

      <View>
        <Text style={styles.logo}>
          StockSight
        </Text>

        <Text style={styles.headerSubtitle}>
          Warehouse Inspector
        </Text>
      </View>
    </View>
  );
}

// ==========================================
// DETAIL COMPONENT
// ==========================================

function Detail({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>
        {label}
      </Text>

      <Text style={styles.detailValue}>
        {String(value)}
      </Text>
    </View>
  );
}

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F7F3',
  },

  content: {
    padding: 20,
    paddingTop: 55,
    paddingBottom: 35,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },

  logoBox: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  logoLetter: {
    color: '#14532D',
    fontSize: 25,
    fontWeight: 'bold',
  },

  logo: {
    color: '#14532D',
    fontSize: 23,
    fontWeight: 'bold',
  },

  headerSubtitle: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 3,
  },

  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    marginBottom: 12,
  },

  backText: {
    color: '#166534',
    fontSize: 14,
    fontWeight: '600',
  },

  pageTitle: {
    color: '#163B29',
    fontSize: 28,
    fontWeight: 'bold',
  },

  subtitle: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 7,
    marginBottom: 20,
  },

  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDEBE0',
    borderRadius: 13,
    padding: 15,
    fontSize: 14,
    color: '#163B29',
  },

  filterScroll: {
    marginTop: 16,
    marginBottom: 15,
    flexGrow: 0,
  },

  filterContainer: {
    gap: 8,
    paddingRight: 8,
  },

  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDEBE0',
  },

  activeFilter: {
    backgroundColor: '#166534',
    borderColor: '#166534',
  },

  filterText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },

  activeFilterText: {
    color: '#FFFFFF',
  },

  resultsText: {
    color: '#64748B',
    fontSize: 13,
    marginBottom: 12,
  },

  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 17,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#E1EDE3',
  },

  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },

  inspectionId: {
    color: '#14532D',
    fontSize: 14,
    fontWeight: 'bold',
    flexShrink: 1,
  },

  status: {
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    fontSize: 11,
    fontWeight: '600',
  },

  completedStatus: {
    color: '#166534',
    backgroundColor: '#DCFCE7',
  },

  pendingStatus: {
    color: '#92400E',
    backgroundColor: '#FEF3C7',
  },

  issueStatus: {
    color: '#B91C1C',
    backgroundColor: '#FEE2E2',
  },

  cardProductName: {
    color: '#163B29',
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 13,
  },

  productName: {
    color: '#163B29',
    fontSize: 21,
    fontWeight: 'bold',
    marginTop: 18,
  },

  mutedText: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },

  cardDivider: {
    height: 1,
    backgroundColor: '#EEF2EE',
    marginVertical: 14,
  },

  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },

  quantityLabel: {
    color: '#64748B',
    fontSize: 11,
  },

  quantityValue: {
    color: '#14532D',
    fontSize: 19,
    fontWeight: 'bold',
    marginTop: 4,
  },

  dateContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },

  dateText: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'right',
  },

  viewDetails: {
    color: '#166534',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 8,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },

  emptyTitle: {
    color: '#163B29',
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E1EDE3',
    marginBottom: 16,
  },

  detailRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2EE',
  },

  detailLabel: {
    color: '#64748B',
    fontSize: 12,
  },

  detailValue: {
    color: '#163B29',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 5,
  },

  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    gap: 8,
  },

  quantityBox: {
    flex: 1,
    backgroundColor: '#F3F7F3',
    borderRadius: 12,
    padding: 12,
  },

  differenceWarning: {
    color: '#DC2626',
  },

  sectionTitle: {
    color: '#14532D',
    fontSize: 18,
    fontWeight: 'bold',
  },

  observationText: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
  },

  historyPhoto: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 12,
    backgroundColor: '#E2E8F0',
  },
});
