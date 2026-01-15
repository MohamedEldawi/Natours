import z from "zod";

export const loginSchema = z
  .object({
    email: z.string().email(),
    password: z.string(),
  })
  .strict();

export const signupSchema = z
  .object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
    passwordConfirm: z.string(),
  })
  .strict();
