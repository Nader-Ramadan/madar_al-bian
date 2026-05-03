import { NextRequest } from "next/server";
import { z } from "zod";
import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { hashPassword } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2).max(255),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const limit = checkRateLimit(`register:${ip}`);
  if (!limit.allowed) return fail("طلبات كثيرة جدًا. حاول لاحقًا.", 429);

  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return fail("البيانات غير صالحة", 400, parsed.error.flatten());
    }

    const passwordHash = await hashPassword(parsed.data.password);

    await prisma.user.create({
      data: {
        email: parsed.data.email.trim().toLowerCase(),
        name: parsed.data.name.trim(),
        passwordHash,
        role: UserRole.VIEWER,
        isActive: true,
      },
    });

    return ok({
      email: parsed.data.email.trim().toLowerCase(),
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return fail("يوجد حساب بهذا البريد مسبقًا", 409);
    }
    console.error("Register route error:", error);
    return fail("تعذر إنشاء الحساب", 500);
  }
}
