import { Request, Response } from 'express';
import prisma from '../../../prisma/prisma';
import { loginSchema, registerSchema } from '../../Schemas/auth.schema';

export class AuthController {

    static async login(req: Request, res: Response) {
        try {
            const validation = loginSchema.safeParse(req);
            if (!validation.success) {
                res.status(400).json({ errors: validation.error.format() });
                return;
            }

            const { email, password } = validation.data.body;

            const user = await prisma.user.findUnique({
                where: { email },
                include: {
                    members: {
                        include: {
                            group: true
                        }
                    }
                }
            });

            if (!user || user.passwordHash !== password) {
                res.status(401).json({ message: "Invalid credentials" });
                return;
            }

            res.status(200).json({
                message: "Login successful",
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    phoneNumber: user.phoneNumber,
                    userName: user.userName,
                    memberships: user.members
                }
            });
        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async register(req: Request, res: Response) {
        try {
            const validation = registerSchema.safeParse(req);
            if (!validation.success) {
                res.status(400).json({ errors: validation.error.format() });
                return;
            }

            const { name, email, password, userName, phoneNumber } = validation.data.body;

            const existingUser = await prisma.user.findFirst({
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

            const user = await prisma.user.create({
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
        } catch (error) {
            console.error("Register error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}
