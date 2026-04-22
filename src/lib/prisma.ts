// lib/prisma.ts

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prismaClientSingleton = () => {
  return new PrismaClient();
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrismaTyped = globalThis as unknown as {
  prisma?: PrismaClientSingleton;
};

export const prisma = globalForPrismaTyped.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrismaTyped.prisma = prisma;

// Apply middleware if available
if (typeof (prisma as any)?.$use === 'function') {
  (prisma as any).$use(async (params: any, next: any) => {
    if (params.model === 'FittingSchedule') {
      if (params.action === 'delete') {
        params.action = 'update';
        params.args.data = { deletedAt: new Date() };
      }
      if (params.action === 'deleteMany') {
        params.action = 'updateMany';
        if (params.args.data) {
          params.args.data.deletedAt = new Date();
        } else {
          params.args.data = { deletedAt: new Date() };
        }
      }

      const actionsToFilter = [
        'findUnique',
        'findFirst',
        'findMany',
        'count',
        'update',
        'updateMany', 
      ];
      if (actionsToFilter.includes(params.action)) {
        if (params.args.where?.deletedAt === undefined) {
          params.args.where = {
            ...params.args.where,
            deletedAt: null,
          };
        }
      }
    }
    return next(params);
  });
}

export default prisma;
