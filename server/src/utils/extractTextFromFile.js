import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

export const extractTextFromFile = async (file) => {
  const filename = file.originalname.toLowerCase();
  const mimetype = file.mimetype?.toLowerCase() || "";

  const isPlainText =
    mimetype.startsWith("text/") || filename.endsWith(".txt") || filename.endsWith(".md");

  if (isPlainText) {
    return file.buffer.toString("utf8").trim();
  }

  const isPdf = mimetype === "application/pdf" || filename.endsWith(".pdf");
  if (isPdf) {
    const parser = new PDFParse({ data: file.buffer });
    try {
      const result = await parser.getText();
      return result.text?.trim() || "";
    } finally {
      await parser.destroy().catch(() => {});
    }
  }

  const isDocx =
    mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    filename.endsWith(".docx");

  if (isDocx) {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value?.trim() || "";
  }

  return "";
};
