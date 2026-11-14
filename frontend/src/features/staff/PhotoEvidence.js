
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';

export default function PhotoEvidence({ onBack, onContinue }) {
  const [observations, setObservations] = useState('');
  const [damaged, setDamaged] = useState(false);
  const [missing, setMissing] = useState(false);
  const [quantityMismatch, setQuantityMismatch] = useState(false);
  const [photos, setPhotos] = useState([]);

  // Open phone camera
  const openCamera = async () => {
    try {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow camera access to take photos.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled) {
        setPhotos((current) => [
          ...current,
          ...result.assets,
        ]);
      }
    } catch (error) {
      Alert.alert('Camera Error', error.message);
    }
  };

  // Open phone gallery
  const openGallery = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow gallery access to select photos.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: 5,
        quality: 0.8,
      });

      if (!result.canceled) {
        setPhotos((current) => {
          const combined = [...current, ...result.assets];
          return combined.slice(0, 5);
        });
      }
    } catch (error) {
      Alert.alert('Gallery Error', error.message);
    }
  };

  // Choose camera or gallery
  const handleAddPhoto = () => {
    if (photos.length >= 5) {
      Alert.alert(
        'Photo Limit Reached',
        'You can add a maximum of 5 photos.'
      );
      return;
    }

    Alert.alert(
      'Add Photo',
      'Choose how you want to add photo evidence.',
      [
        {
          text: 'Take Photo',
          onPress: openCamera,
        },
        {
          text: 'Choose from Gallery',
          onPress: openGallery,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  // Remove selected photo
  const removePhoto = (uri) => {
    setPhotos((current) =>
      current.filter((photo) => photo.uri !== uri)
    );
  };

  // Continue to inspection history
  const handleContinue = () => {
    if (typeof onContinue === 'function') {
      onContinue({
        observations,
        issues: {
          damaged,
          missing,
          quantityMismatch,
        },
        photos: photos.map((photo) => ({
          uri: photo.uri,
          fileName: photo.fileName || null,
          mimeType: photo.mimeType || null,
        })),
      });
    }
  };

  const IssueCheckbox = ({ label, checked, onPress }) => (
    <TouchableOpacity
      style={styles.issueRow}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>

      <Text style={styles.issueLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoLetter}>S</Text>
          </View>

          <View style={styles.brand}>
            <Text style={styles.logo}>StockSight</Text>
            <Text style={styles.subtitle}>
              Warehouse Inspector
            </Text>
          </View>
        </View>

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Text style={styles.backText}>
            ‹ Back to New Inspection
          </Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Photo Capture</Text>

        <Text style={styles.description}>
          Capture evidence and record inspection observations.
        </Text>

        {/* Photo Evidence */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Photo Evidence
          </Text>

          <Text style={styles.helperText}>
            Add photos showing the product condition or stock discrepancy.
            You can add up to 5 photos.
          </Text>

          {photos.length === 0 ? (
            <View style={styles.photoArea}>
              <Text style={styles.cameraIcon}>▧</Text>
              <Text style={styles.emptyTitle}>
                No photos added yet
              </Text>
              <Text style={styles.emptyText}>
                Your photo previews will appear here.
              </Text>
            </View>
          ) : (
            <View style={styles.photoPreviewArea}>
              {photos.map((photo, index) => (
                <View key={photo.uri} style={styles.photoItem}>
                  <Image
                    source={{ uri: photo.uri }}
                    style={styles.photoPreview}
                  />

                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => removePhoto(photo.uri)}
                  >
                    <Text style={styles.removePhotoText}>×</Text>
                  </TouchableOpacity>

                  <Text style={styles.photoNumber}>
                    Photo {index + 1}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.addPhotoButton}
            onPress={handleAddPhoto}
            activeOpacity={0.8}
          >
            <Text style={styles.addPhotoText}>
              ＋ Add Photo
            </Text>
          </TouchableOpacity>
        </View>

        {/* Observations */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Observations
          </Text>

          <Text style={styles.helperText}>
            Describe anything unusual found during inspection.
          </Text>

          <TextInput
            style={styles.observationInput}
            placeholder="Enter your inspection observations..."
            placeholderTextColor="#94A3B8"
            value={observations}
            onChangeText={setObservations}
            multiline
            maxLength={1000}
            textAlignVertical="top"
          />

          <Text style={styles.characterCount}>
            {observations.length}/1000 characters
          </Text>
        </View>

        {/* Observed Issues */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Observed Issues
          </Text>

          <Text style={styles.helperText}>
            Select every issue identified.
          </Text>

          <IssueCheckbox
            label="Damaged items"
            checked={damaged}
            onPress={() => setDamaged((value) => !value)}
          />

          <IssueCheckbox
            label="Missing items"
            checked={missing}
            onPress={() => setMissing((value) => !value)}
          />

          <IssueCheckbox
            label="Quantity mismatch"
            checked={quantityMismatch}
            onPress={() =>
              setQuantityMismatch((value) => !value)
            }
          />
        </View>

        {/* Continue */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueText}>
            Continue to Inspection History →
          </Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Check your observations before continuing.
        </Text>
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
    paddingBottom: 35,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },

  logoBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoLetter: {
    color: '#14532D',
    fontSize: 26,
    fontWeight: 'bold',
  },

  brand: {
    marginLeft: 12,
  },

  logo: {
    color: '#14532D',
    fontSize: 24,
    fontWeight: 'bold',
  },

  subtitle: {
    color: '#64748B',
    fontSize: 13,
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
    fontSize: 29,
    fontWeight: 'bold',
    color: '#163B29',
  },

  description: {
    color: '#64748B',
    fontSize: 15,
    marginTop: 8,
    marginBottom: 24,
  },

  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDEBE0',
    marginBottom: 18,
  },

  sectionTitle: {
    color: '#14532D',
    fontSize: 20,
    fontWeight: 'bold',
  },

  helperText: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 16,
  },

  photoArea: {
    minHeight: 155,
    backgroundColor: '#F3F7F3',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DDEBE0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },

  cameraIcon: {
    color: '#15803D',
    fontSize: 35,
    marginBottom: 8,
  },

  emptyTitle: {
    color: '#163B29',
    fontWeight: 'bold',
    fontSize: 15,
  },

  emptyText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 7,
    textAlign: 'center',
  },

  photoPreviewArea: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  photoItem: {
    width: '47%',
    marginBottom: 8,
    position: 'relative',
  },

  photoPreview: {
    width: '100%',
    height: 125,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },

  removePhotoButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#991B1B',
    alignItems: 'center',
    justifyContent: 'center',
  },

  removePhotoText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 23,
  },

  photoNumber: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 5,
  },

  addPhotoButton: {
    borderWidth: 1,
    borderColor: '#15803D',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 14,
  },

  addPhotoText: {
    color: '#166534',
    fontSize: 15,
    fontWeight: 'bold',
  },

  observationInput: {
    minHeight: 130,
    backgroundColor: '#F8FAF8',
    borderWidth: 1,
    borderColor: '#DDEBE0',
    borderRadius: 12,
    padding: 14,
    color: '#334155',
    fontSize: 14,
  },

  characterCount: {
    textAlign: 'right',
    color: '#64748B',
    fontSize: 11,
    marginTop: 8,
  },

  issueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2EE',
  },

  checkbox: {
    width: 23,
    height: 23,
    borderWidth: 1.5,
    borderColor: '#CBD5D1',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  checkboxChecked: {
    backgroundColor: '#166534',
    borderColor: '#166534',
  },

  checkmark: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  issueLabel: {
    color: '#334155',
    fontSize: 14,
  },

  continueButton: {
    backgroundColor: '#166534',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },

  continueText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  footerText: {
    color: '#64748B',
    textAlign: 'center',
    fontSize: 12,
    marginTop: 16,
  },
});
