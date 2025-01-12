import { PrismaClient } from '@prisma/client';

// Function to create a new instance of PrismaClient
const prismaClientSingleton = () => { return new PrismaClient(); }

// Define a type for the singleton instance of PrismaClient
type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

// Use the global object to store the PrismaClient instance for reuse
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

// Reuse the existing PrismaClient instance or create a new one
const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma;

// In non-production environments, store the PrismaClient instance globally
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;