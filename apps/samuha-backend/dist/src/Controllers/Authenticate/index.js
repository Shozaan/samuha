"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const prisma_1 = __importDefault(require("../../../prisma/prisma"));
const auth_schema_1 = require("../../Schemas/auth.schema");
class AuthController {
    static async login(req, res) {
        try {
            const validation = auth_schema_1.loginSchema.safeParse(req);
            if (!validation.success) {
                res.status(400).json({ errors: validation.error.format() });
                return;
            }
            const { email, password } = validation.data.body;
            const user = await prisma_1.default.user.findUnique({
                where: { email },
            });
            if (!user || user.passwordHash !== password) {
                res.status(401).json({ message: "Invalid credentials" });
                return;
            }
            res.status(200).json({
                message: "Login successful",
                user: { id: user.id, email: user.email, name: user.name }
            });
        }
        catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
    static async register(req, res) {
        try {
            const validation = auth_schema_1.registerSchema.safeParse(req);
            if (!validation.success) {
                res.status(400).json({ errors: validation.error.format() });
                return;
            }
            const { name, email, password, userName, phoneNumber } = validation.data.body;
            const existingUser = await prisma_1.default.user.findFirst({
                where: {
                    OR: [
                        { email },
                        { userName },
                        { phoneNumber }
                    ]
                }
            });
            if (existingUser) {
                res.status(400).json({ message: "User with this email, username, or phone number already exists" });
                return;
            }
            const user = await prisma_1.default.user.create({
                data: {
                    name,
                    email,
                    userName,
                    phoneNumber,
                    passwordHash: password
                }
            });
            res.status(201).json({
                message: "User registered successfully",
                user: { id: user.id, email: user.email, name: user.name }
            });
        }
        catch (error) {
            console.error("Register error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}
exports.AuthController = AuthController;
