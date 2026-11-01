
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const SAMPLE_INSPECTIONS = [
  {
    id: 'INS-0032',
    productId: 'PRD00123',
    productName: 'Wireless Headphones',
    category: 'Electronics',
    expectedQty: 20,
    actualQty: 18,
    location: 'Warehouse A - Shelf 03',
    condition: 'Quantity Mismatch',
    status: 'Issues',
    date: '28 Oct 2026, 10:30 AM',
    observations:
      'Two items are missing from the expected stock quantity.',
  },
  {
    id: 'INS-0031',
    productId: 'PRD00124',
    productName: 'Wireless Mouse',
    category: 'Electronics',
    expectedQty: 15,
    actualQty: 15,
    location: 'Warehouse A - Shelf 04',
    condition: 'Good',
    status: 'Completed',
    date: '28 Oct 2026, 9:15 AM',
    observations: 'All products are in good condition.',
  },
  {
    id: 'INS-0030',
    productId: 'PRD00125',
    productName: 'Keyboard',
    category: 'Electronics',
    expectedQty: 12,
    actualQty: 12,
    location: 'Warehouse B - Shelf 02',
    condition: 'Good',
    status: 'Pending',
    date: '27 Oct 2026, 4:20 PM',
    observations: 'Awaiting final review.',
  },
  {
    id: 'INS-0029',
    productId: 'PRD00126',
    productName: 'USB Cable',
    category: 'Accessories',
    expectedQty: 30,
    actualQty: 30,
    location: 'Warehouse A - Shelf 06',
    condition: 'Good',
    status: 'Completed',
    date: '27 Oct 2026, 2:00 PM',
    observations: 'Stock verified successfully.',
  },
];

const FILTERS = ['All', 'Completed', 'Pending', 'Issues'];

export default function InspectionHistory({ onBack }) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedInspection, setSelectedInspection] = useState(null);

  const filteredInspections = SAMPLE_INSPECTIONS.filter((item) => {
    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      item.id.toLowerCase().includes(searchText) ||
      item.productId.toLowerCase().includes(searchText) ||
      item.productName.toLowerCase().includes(searchText);

    const matchesFilter =
      activeFilter === 'All' || item.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  const getStatusStyle = (status) => {
    if (status === 'Completed') return styles.completedStatus;
    if (status === 'Pending') return styles.pendingStatus;
    return styles.issueStatus;
  };

  // Inspection details screen
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

          <Text style={styles.pageTitle}>Inspection Details</Text>

          <Text style={styles.subtitle}>
            Full record of the selected inspection.
          </Text>

          <View style={styles.card}>
            <View style={styles.detailHeader}>
              <Text style={styles.inspectionId}>{item.id}</Text>

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
            <Detail label="Inspection Date" value={item.date} />
            <Detail label="Warehouse Location" value={item.location} />
            <Detail label="Product Condition" value={item.condition} />

            <View style={styles.quantityRow}>
              <View style={styles.quantityBox}>
                <Text style={styles.quantityLabel}>Expected</Text>
                <Text style={styles.quantityValue}>
                  {item.expectedQty}
                </Text>
              </View>

              <View style={styles.quantityBox}>
                <Text style={styles.quantityLabel}>Actual</Text>
                <Text style={styles.quantityValue}>
                  {item.actualQty}
                </Text>
              </View>

              <View style={styles.quantityBox}>
                <Text style={styles.quantityLabel}>Difference</Text>
                <Text
                  style={[
                    styles.quantityValue,
                    item.expectedQty !== item.actualQty &&
                      styles.differenceWarning,
                  ]}
                >
                  {item.actualQty - item.expectedQty > 0 ? '+' : ''}
                  {item.actualQty - item.expectedQty}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Observations</Text>
            <Text style={styles.observationText}>
              {item.observations || 'No observations recorded.'}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Photo Evidence</Text>
            <Text style={styles.mutedText}>
              No photos are attached to this sample record.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Inspection history list screen
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

        <Text style={styles.pageTitle}>Inspection History</Text>

        <Text style={styles.subtitle}>
          Search and review your warehouse inspections.
        </Text>

        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search inspection ID or product..."
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          returnKeyType="search"
        />

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
                activeFilter === filter && styles.activeFilter,
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter && styles.activeFilterText,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.resultsText}>
          {filteredInspections.length} inspection
          {filteredInspections.length === 1 ? '' : 's'} found
        </Text>

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
              key={item.id}
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
                    Actual Quantity
                  </Text>
                  <Text style={styles.quantityValue}>
                    {item.actualQty}
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
      </ScrollView>
    </View>
  );
}

function Header() {
  return (
    <View style={styles.header}>
      <View style={styles.logoBox}>
        <Text style={styles.logoLetter}>S</Text>
      </View>

      <View>
        <Text style={styles.logo}>StockSight</Text>
        <Text style={styles.headerSubtitle}>
          Warehouse Inspector
        </Text>
      </View>
    </View>
  );
}

function Detail({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{String(value)}</Text>
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
});
