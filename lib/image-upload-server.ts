/**
 * Server-side helper to decode base64 data URLs back to Node.js/Next.js File objects.
 * This is used to bypass Next.js Server Action multipart/form-data corruption issues.
 */
export function getFileFromFormData(formData: FormData, fieldName = "file"): File | null {
  const file = formData.get(fieldName);
  if (!file) return null;

  // If it's a base64 Data URL string
  if (typeof file === "string" && file.startsWith("data:")) {
    try {
      const mimeType = file.substring(file.indexOf(":") + 1, file.indexOf(";"));
      const base64Data = file.substring(file.indexOf(",") + 1);
      const buffer = Buffer.from(base64Data, "base64");
      
      const originalFileName = (formData.get("fileName") as string) || `upload.${mimeType.split("/")[1] || "webp"}`;
      
      // Construct a server-side File object
      return new File([buffer], originalFileName, { type: mimeType });
    } catch (err) {
      console.error("Failed to parse base64 file on server:", err);
      return null;
    }
  }

  // Fallback to standard File object if it's already a File
  return file as File;
}
