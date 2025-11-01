import { z } from "zod";

export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  passwordHash: z.string(),
  publicKey: z.string(),
  isAdmin: z.boolean(),
  disabled: z.boolean(),
});

export const insertUserSchema = userSchema.omit({ id: true });

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

export const messageSchema = z.object({
  id: z.number(),
  sender: z.number(),
  receiver: z.number(),
  ciphertext: z.string(),
  nonce: z.string(),
  createdAt: z.number(),
});

export const insertMessageSchema = messageSchema.omit({ id: true, createdAt: true });

export type Message = z.infer<typeof messageSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
