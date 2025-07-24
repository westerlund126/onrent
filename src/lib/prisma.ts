// lib/prisma.ts

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

prisma.$use(async (params, next) => {
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

export default prisma;
