import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  search: z.string().optional(),
});

export const magazineSchema = z.object({
  title: z.string().min(2).max(255),
  description: z.string().min(5),
  image: z.string().min(1).max(255),
  category: z.string().min(2).max(100),
  pdfUrl: z.string().url().optional().nullable(),
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
  image: z.string().min(1).max(255),
  bio: z.string().min(10),
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
