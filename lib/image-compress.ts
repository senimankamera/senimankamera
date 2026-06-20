/**
 * Client-side image compression helper to avoid HTTP 413 (Content Too Large) errors on Vercel.
 * Resizes the image to a maximum width (default 1920px) and converts it to WebP format with high quality.
 */
export function compressImage(file: File, maxWidth = 1920, quality = 0.85): Promise<File> {
  return new Promise((resolve, reject) => {
    // If not an image, return original file (e.g. video files)
    if (!file.type.startsWith("image/")) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Resize if width is larger than maxWidth
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(file); // Fallback to original file
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file); // Fallback to original file
            }
            
            // Create a new File from the blob with .webp extension
            const originalName = file.name;
            const nameWithoutExtension = originalName.substring(0, originalName.lastIndexOf(".")) || originalName;
            
            const compressedFile = new File([blob], `${nameWithoutExtension}.webp`, {
              type: "image/webp",
              lastModified: Date.now(),
            });

            console.log(
              `Compressed client-side: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB) -> ` +
              `${compressedFile.name} (${(compressedFile.size / 1024 / 1024).toFixed(2)} MB)`
            );

            resolve(compressedFile);
          },
          "image/webp",
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
