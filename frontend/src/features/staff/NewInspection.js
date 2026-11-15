
import React, { useState, useEffect } from 'react';

import {
  getProducts,
  getInventoryByProductId,
  getShelfSectionById,
} from './staffService';

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
  const [location, setLocation] = useState('');
  const [condition, setCondition] = useState('Good');

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [showProductList, setShowProductList] = useState(false);

  // Load active products from Firestore
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);

        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error('Error loading products:', error);
        Alert.alert(
          'Error',
          'Unable to load products from Firestore.'
        );
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  const conditions = [
    'Good',
    'Damaged',
    'Missing',
    'Quantity Mismatch',
  ];

  // Validate details and continue to Photo Evidence
  const handleNext = () => {
    if (
      !productId.trim() ||
      !productName.trim() ||
      !expectedQty.trim() ||
      !location.trim()
    ) {
      Alert.alert(
        'Missing Information',
        'Please complete the product details, expected quantity and warehouse location.'
      );
      return;
    }

    const expected = Number(expectedQty);

    if (!Number.isInteger(expected) || expected < 0) {
      Alert.alert(
        'Invalid Quantity',
        'Please enter a valid, non-negative whole number for expected quantity.'
      );
      return;
    }

    if (typeof onContinue === 'function') {
      onContinue({
        productId: productId.trim(),
        productName: productName.trim(),
        category: category.trim(),
        expectedQty: expected,
        location: location.trim(),
        condition,
        inventoryId:
          selectedInventory?.inventory_id ||
          selectedInventory?.id ||
          '',
        sectionId: selectedInventory?.section_id || '',
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
        {/* Header */}
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

        {/* Product Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Product Details
          </Text>

          {/* Product Dropdown */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Select Product *
            </Text>

            <TouchableOpacity
              style={styles.productSelect}
              onPress={() =>
                setShowProductList(!showProductList)
              }
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.productSelectText,
                  !productName && styles.placeholderText,
                ]}
              >
                {loadingProducts
                  ? 'Loading products...'
                  : productName || 'Select a product'}
              </Text>

              <Text style={styles.dropdownArrow}>
                {showProductList ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {showProductList && (
              <View style={styles.productDropdown}>
                {loadingProducts ? (
                  <Text style={styles.emptyProductText}>
                    Loading products...
                  </Text>
                ) : products.length > 0 ? (
                  products.map((product) => (
                    <TouchableOpacity
                      key={product.id}
                      style={styles.productOption}
                      onPress={async () => {
                        try {
                          setProductId(product.product_id);
                          setProductName(product.product_name);
                          setCategory(product.category_id || '');
                          setShowProductList(false);

                          // Clear previous product details
                          setExpectedQty('');
                          setLocation('');
                          setSelectedInventory(null);

                          // Retrieve inventory from Firestore
                          const inventoryRecords =
                            await getInventoryByProductId(
                              product.product_id
                            );

                          if (inventoryRecords.length === 0) {
                            Alert.alert(
                              'Inventory Not Found',
                              'No inventory record exists for this product.'
                            );
                            return;
                          }

                          const inventory = inventoryRecords[0];

                          setSelectedInventory(inventory);

                          // Automatically display expected quantity
                          setExpectedQty(
                            String(inventory.expected_quantity)
                          );

                          // Retrieve shelf section from Firestore
                          const section =
                            await getShelfSectionById(
                              inventory.section_id
                            );

                          if (!section) {
                            Alert.alert(
                              'Section Not Found',
                              'Unable to retrieve the shelf location.'
                            );
                            return;
                          }

                          // Automatically display shelf location
                          setLocation(
                            section.section_code ||
                            section.description ||
                            ''
                          );
                        } catch (error) {
                          console.error(
                            'Error retrieving product details:',
                            error
                          );

                          Alert.alert(
                            'Error',
                            'Unable to retrieve product and inventory details.'
                          );
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.productOptionName}>
                        {product.product_name}
                      </Text>

                      <Text style={styles.productOptionId}>
                        Product ID: {product.product_id}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.emptyProductText}>
                    No active products found.
                  </Text>
                )}
              </View>
            )}
          </View>

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

        {/* Stock Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Stock Details
          </Text>

          <InputField
            label="Expected Qty *"
            value={expectedQty}
            onChangeText={setExpectedQty}
            placeholder="e.g. 20"
            keyboardType="number-pad"
          />

          <InputField
            label="Warehouse Location *"
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. Warehouse A - Shelf 03"
          />
        </View>

        {/* Product Condition */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Product Condition
          </Text>

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

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>
            Continue to Photo Evidence →
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

  // Product dropdown styles
  productSelect: {
    backgroundColor: '#F8FAF8',
    borderWidth: 1,
    borderColor: '#DCE6DD',
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  productSelectText: {
    fontSize: 14,
    color: '#163B29',
  },

  placeholderText: {
    color: '#94A3B8',
  },

  dropdownArrow: {
    color: '#64748B',
    fontSize: 12,
  },

  productDropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE6DD',
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
  },

  productOption: {
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#E1EDE3',
  },

  productOptionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },

  productOptionId: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },

  emptyProductText: {
    padding: 14,
    fontSize: 13,
    color: '#64748B',
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
