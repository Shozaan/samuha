// src/services/prisma.service.ts

import { PrismaClient } from '@prisma/client';

class PrismaService {
    private static instance: PrismaService;
    public prisma: PrismaClient;

    private constructor() {
        this.prisma = new PrismaClient({
            log: ['query', 'info', 'warn', 'error'],
        });
    }

    public static getInstance(): PrismaService {
        if (!PrismaService.instance) {
            PrismaService.instance = new PrismaService();
        }
        return PrismaService.instance;
    }

    async connect(): Promise<void> {
        try {
            await this.prisma.$connect();
            console.log('✅ Prisma connected to Karma database');
        } catch (error) {
            console.error('❌ Failed to connect to database:', error);
            process.exit(1);
        }
    }

    async disconnect(): Promise<void> {
        await this.prisma.$disconnect();
        console.log('❌ Prisma disconnected');
    }

    async isHealthy(): Promise<boolean> {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return true;
        } catch (error) {
            return false;
        }
    }
}

export default PrismaService.getInstance();