"use strict";
// src/services/prisma.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
class PrismaService {
    constructor() {
        this.prisma = new client_1.PrismaClient({
            log: ['query', 'info', 'warn', 'error'],
        });
    }
    static getInstance() {
        if (!PrismaService.instance) {
            PrismaService.instance = new PrismaService();
        }
        return PrismaService.instance;
    }
    async connect() {
        try {
            await this.prisma.$connect();
            console.log('✅ Prisma connected to Karma database');
        }
        catch (error) {
            console.error('❌ Failed to connect to database:', error);
            process.exit(1);
        }
    }
    async disconnect() {
        await this.prisma.$disconnect();
        console.log('❌ Prisma disconnected');
    }
    async isHealthy() {
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            return true;
        }
        catch (error) {
            return false;
        }
    }
}
exports.default = PrismaService.getInstance();
