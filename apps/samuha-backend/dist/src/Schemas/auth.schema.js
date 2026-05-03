"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email({ message: "Invalid email address" }),
        password: zod_1.z.string().min(6, { message: "Password must be at least 6 characters" }),
    }),
});
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, { message: "Name must be at least 2 characters" }),
        userName: zod_1.z.string().min(3, { message: "Username must be at least 3 characters" }),
        email: zod_1.z.string().email({ message: "Invalid email address" }),
        phoneNumber: zod_1.z.string().min(10, { message: "Invalid phone number" }),
        password: zod_1.z.string().min(6, { message: "Password must be at least 6 characters" }),
    }),
});
