import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
});

export const magazineSchema = z.object({
  title: z.string().min(2).max(255),
  description: z.string().min(5),
  image: z.string().min(1).max(255),
  category: z.string().min(2).max(100),
  pdfUrl: z.string().url().optional().nullable(),
  issn: z.string().max(32).optional().nullable(),
  impactFactor: z.coerce.number().finite().optional().nullable(),
  currentVersion: z.string().max(50).optional().nullable(),
  nextVersionRelease: z.coerce.date().optional().nullable(),
  publicationPreference: z.string().optional().nullable(),
  versionMessage: z.string().optional().nullable(),
  certification: z.string().optional().nullable(),
  advisorsApproved: z.boolean().optional(),
  approvedAdvisorIds: z.array(z.number().int().positive()).optional().default([]),
  versionCount: z.number().int().min(0).optional(),
});

export const blogSchema = z.object({
  title: z.string().min(2).max(255),
  summary: z.string().min(10),
  date: z.string().min(2).max(50),
  author: z.string().min(2).max(255),
  image: z.string().max(255).optional().nullable(),
});

export const conferenceSchema = z.object({
  title: z.string().min(2).max(255),
  description: z.string().min(10),
  date: z.string().min(2).max(50),
  location: z.string().min(2).max(255),
  image: z.string().max(255).optional().nullable(),
  attendees: z.string().max(100).optional().nullable(),
});

export const advisoryMemberSchema = z.object({
  name: z.string().min(2).max(255),
  title: z.string().min(2).max(255),
  image: z.union([z.string().url().max(255), z.literal(""), z.null()]).optional(),
  bio: z.union([z.string().max(4000), z.literal(""), z.null()]).optional(),
});

export const fieldSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().min(10),
});

export const magazineVersionSchema = z.object({
  magazineId: z.number().int().positive(),
  version: z.string().min(1).max(50),
  title: z.string().min(2).max(255),
  releaseDate: z.string().datetime(),
  notes: z.string().optional().nullable(),
  pageCount: z.union([z.number().int().positive().max(500000), z.null()]).optional(),
  pdfUrl: z.union([z.string().url().max(500), z.null()]).optional(),
});

const imageContentTypes = ["image/jpeg", "image/png", "image/webp"] as const;

export const advisoryMemberUploadPresignSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.enum(imageContentTypes),
  size: z.number().int().positive().max(8 * 1024 * 1024),
});

export const magazineAdvisorCreateSchema = z.object({
  name: z.string().min(2).max(255),
  jobTitle: z.string().min(1).max(4000),
  photoUrl: z.string().min(1).max(500),
});

export const magazineAdvisorUploadPresignSchema = z.object({
  magazineId: z.number().int().positive(),
  filename: z.string().min(1).max(255),
  contentType: z.enum(imageContentTypes),
  size: z.number().int().positive().max(5 * 1024 * 1024),
});

export const magazineBannerUploadPresignSchema = z.object({
  magazineId: z.number().int().positive().optional(),
  filename: z.string().min(1).max(255),
  contentType: z.enum(imageContentTypes),
  size: z.number().int().positive().max(8 * 1024 * 1024),
});

export const publicationRequestSchema = z.object({
  authorName: z.string().min(2).max(255),
  authorEmail: z.string().email(),
  title: z.string().min(2).max(255),
  abstract: z.string().min(20),
  field: z.string().max(255).optional().nullable(),
});

export const publicationStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  reviewNotes: z.string().optional().nullable(),
});

export const sendEmailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(2).max(255),
  body: z.string().min(2),
});

export const passwordForgotSchema = z.object({
  email: z.string().email(),
});

export const passwordResetSchema = z.object({
  token: z.string().min(16).max(255),
  password: z.string().min(8).max(128),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(6).max(128),
  newPassword: z.string().min(8).max(128),
});
