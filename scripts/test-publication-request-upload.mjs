/**
 * POST multipart to /api/publication-requests (local dev).
 * Usage: SITE_URL=http://localhost:3000 node scripts/test-publication-request-upload.mjs
 */
import { File } from "node:buffer";

const base = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const words = Array.from({ length: 210 }, (_, i) => `word${i + 1}`).join(" ");

const file = new File(
  [Buffer.from("PK fake docx content for test")],
  "study.docx",
  {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
);

const fd = new FormData();
fd.append("authorName", "Test Author Name");
fd.append("title", "Test Study Title Long Enough");
fd.append("authorEmail", "test@example.com");
fd.append("authorPhoneCountry", "EG");
fd.append("authorPhoneNational", "1012345678");
fd.append("abstract", words);
fd.append("file", file);

const res = await fetch(`${base}/api/publication-requests`, { method: "POST", body: fd });
const text = await res.text();
console.log(`HTTP ${res.status}`);
console.log(text.slice(0, 800));
