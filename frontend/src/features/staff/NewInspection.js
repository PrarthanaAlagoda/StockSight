
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

// Keep InputField outside NewInspection so typing
// doesn't cause the input to lose focus.
function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
    </View>
  );
}

export default function NewInspection({ onBack, onContinue }) {
  const [productId, setProductId] = useState('');
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [expectedQty, setExpectedQty] = useState('');
  const [actualQty, setActualQty] = useState('');
  const [location, setLocation] = useState('');
  const [condition, setCondition] = useState('Good');

  const conditions = [
    'Good',
    'Damaged',
    'Missing',
    'Quantity Mismatch',
  ];

  const handleNext = () => {
    if (
      !productId.trim() ||
      !productName.trim() ||
      !expectedQty.trim() ||
      !actualQty.trim() ||
      !location.trim()
    ) {
      Alert.alert(
        'Missing Information',
        'Please complete the product ID, product name, quantities and warehouse location.'
      );
      return;
    }

    const expected = Number(expectedQty);
    const actual = Number(actualQty);

    if (
      !Number.isInteger(expected) ||
      !Number.isInteger(actual) ||
      expected < 0 ||
      actual < 0
    ) {
      Alert.alert(
        'Invalid Quantity',
        'Please enter valid, non-negative whole numbers for both quantities.'
      );
      return;
    }

    if (typeof onContinue === 'function') {
      onContinue({
        productId: productId.trim(),
        productName: productName.trim(),
        category: category.trim(),
        expectedQty: expected,
        actualQty: actual,
        location: location.trim(),
        condition,
      });
    } else {
      Alert.alert(
        'Navigation Not Connected',
        'Please check the screen connection in index.js.'
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>S</Text>
          </View>

          <View style={styles.headerText}>
            <Text style={styles.appName}>StockSight</Text>
            <Text style={styles.subtitle}>
              Warehouse Inspector
            </Text>
          </View>
        </View>

        {onBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Text style={styles.backText}>
              ‹  Back to Dashboard
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.pageTitle}>New Inspection</Text>
        <Text style={styles.pageDescription}>
          Enter the product and stock details below.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Details</Text>

          <InputField
            label="Product ID / SKU *"
            value={productId}
            onChangeText={setProductId}
            placeholder="e.g. PRD00123"
          />

          <InputField
            label="Product Name *"
            value={productName}
            onChangeText={setProductName}
            placeholder="e.g. Wireless Mouse"
          />

          <InputField
            label="Category"
            value={category}
            onChangeText={setCategory}
            placeholder="e.g. Electronics"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stock Details</Text>

          <View style={styles.quantityRow}>
            <View style={styles.quantityField}>
              <InputField
                label="Expected Qty *"
                value={expectedQty}
                onChangeText={setExpectedQty}
                placeholder="e.g. 20"
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.quantityField}>
              <InputField
                label="Actual Qty *"
                value={actualQty}
                onChangeText={setActualQty}
                placeholder="e.g. 18"
                keyboardType="number-pad"
              />
            </View>
          </View>

          {expectedQty.trim() !== '' &&
            actualQty.trim() !== '' &&
            Number.isInteger(Number(expectedQty)) &&
            Number.isInteger(Number(actualQty)) &&
            Number(expectedQty) >= 0 &&
            Number(actualQty) >= 0 && (
              <View style={styles.differenceCard}>
                <Text style={styles.differenceLabel}>
                  Quantity Difference
                </Text>
                <Text
                  style={[
                    styles.differenceValue,
                    Number(actualQty) !== Number(expectedQty) &&
                      styles.differenceWarning,
                  ]}
                >
                  {Number(actualQty) - Number(expectedQty) > 0
                    ? '+'
                    : ''}
                  {Number(actualQty) - Number(expectedQty)}
                </Text>
              </View>
            )}

          <InputField
            label="Warehouse Location *"
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. Warehouse A - Shelf 03"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Condition</Text>
          <Text style={styles.helperText}>
            Select the condition observed during inspection.
          </Text>

          <View style={styles.conditionGrid}>
            {conditions.map((item) => {
              const selected = condition === item;

              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.conditionButton,
                    selected && styles.conditionSelected,
                  ]}
                  onPress={() => setCondition(item)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.conditionText,
                      selected && styles.conditionTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>
            Continue to Photo Evidence  →
          </Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          * Required fields
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
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
    marginBottom: 20,
  },
  logoCircle: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoIcon: {
    color: '#14532D',
    fontSize: 25,
    fontWeight: 'bold',
  },
  headerText: {
    marginLeft: 12,
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#14532D',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    marginBottom: 8,
  },
  backText: {
    color: '#166534',
    fontSize: 14,
    fontWeight: '600',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#163B29',
  },
  pageDescription: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 7,
    marginBottom: 25,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E1EDE3',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#14532D',
    marginBottom: 18,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAF8',
    borderWidth: 1,
    borderColor: '#DCE6DD',
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 13,
    fontSize: 14,
    color: '#163B29',
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  quantityField: {
    flex: 1,
  },
  differenceCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  differenceLabel: {
    color: '#166534',
    fontSize: 13,
    fontWeight: '600',
  },
  differenceValue: {
    color: '#166534',
    fontSize: 20,
    fontWeight: 'bold',
  },
  differenceWarning: {
    color: '#DC2626',
  },
  helperText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: -8,
    marginBottom: 15,
  },
  conditionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  conditionButton: {
    width: '48%',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#DCE6DD',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  conditionSelected: {
    backgroundColor: '#DCFCE7',
    borderColor: '#15803D',
    borderWidth: 1.5,
  },
  conditionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  conditionTextSelected: {
    color: '#14532D',
  },
  primaryButton: {
    backgroundColor: '#166534',
    paddingVertical: 17,
    paddingHorizontal: 12,
    borderRadius: 13,
    alignItems: 'center',
    marginTop: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  footerText: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 12,
    marginTop: 15,
  },
});
