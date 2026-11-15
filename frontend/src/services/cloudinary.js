
const CLOUDINARY_CLOUD_NAME = 'npj3axgd';
const CLOUDINARY_UPLOAD_PRESET = 'stocksight_inspections';

export const uploadInspectionImage = async (imageBase64) => {
  try {
    if (!imageBase64) {
      throw new Error('Image data is missing.');
    }

    const formData = new FormData();

    // Send the image as a Base64 data URI
    formData.append(
      'file',
      `data:image/jpeg;base64,${imageBase64}`
    );

    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'stocksight/inspections');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error?.message || 'Image upload failed'
      );
    }

    return {
      imageUrl: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};
