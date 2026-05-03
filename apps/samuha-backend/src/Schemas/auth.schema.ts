import { z } from 'zod';

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email({ message: "Invalid email address" }),
        password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    }),
});

export const registerSchema = z.object({
    body: z.object({
        name: z.string().min(2, { message: "Name must be at least 2 characters" }),
        userName: z.string().min(3, { message: "Username must be at least 3 characters" }),
        email: z.string().email({ message: "Invalid email address" }),
        phoneNumber: z.string().min(10, { message: "Invalid phone number" }),
        password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    }),
});

export type LoginInput = z.infer<typeof loginSchema>['body'];
export type RegisterInput = z.infer<typeof registerSchema>['body'];
