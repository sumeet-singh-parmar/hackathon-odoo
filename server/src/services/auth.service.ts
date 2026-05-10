import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { signToken } from "../lib/jwt";
import { Conflict, Unauthorized } from "../lib/errors";
import type { LoginInput, RegisterInput } from "@hackathon/shared";

const SALT_ROUNDS = 10;

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new Conflict("Email already registered");

  const hash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { email: input.email, password: hash, name: input.name },
    select: { id: true, email: true, name: true, createdAt: true },
  });
  const token = signToken({ userId: user.id });
  return { user, token };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new Unauthorized("Invalid credentials");

  const ok = await bcrypt.compare(input.password, user.password);
  if (!ok) throw new Unauthorized("Invalid credentials");

  const token = signToken({ userId: user.id });
  return {
    user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
    token,
  };
}

export async function me(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, createdAt: true },
  });
  if (!user) throw new Unauthorized();
  return user;
}
