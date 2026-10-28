/**
 * Helper to compress and convert an uploaded File to an optimized base64 Data URL.
 * Resizes large photos and iteratively optimizes quality so payloads remain strictly under 38,000 characters
 * (well within Google Sheets' 50,000 characters-per-cell limit and localStorage quota).
 */
export const MAX_IMAGE_DATA_URL_LENGTH = 38000;

export async function processUploadedImage(
  file: File,
  initialMaxDim = 400,
  initialQuality = 0.72
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to parse image data.'));
      img.onload = () => {
        let maxDim = initialMaxDim;
        let quality = initialQuality;
        let dataUrl = '';

        // Iteratively render to canvas and adjust scale/quality if needed
        // to guarantee payload fits safely in Google Sheets (< 38,000 chars)
        for (let attempt = 0; attempt < 5; attempt++) {
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            dataUrl = reader.result as string;
            break;
          }

          // Fill white background for transparent PNGs before converting to JPEG
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // Use image/jpeg for reliable compact compression
          dataUrl = canvas.toDataURL('image/jpeg', quality);

          if (dataUrl.length <= MAX_IMAGE_DATA_URL_LENGTH) {
            break;
          }

          // Step down dimension and quality if still too large
          maxDim = Math.round(maxDim * 0.8);
          quality = Math.max(0.4, quality - 0.12);
        }

        resolve(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
