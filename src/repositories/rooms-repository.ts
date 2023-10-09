import { prisma } from '@/config';

async function findRoom(roomId: number) {
  return prisma.room.findUnique({
    where: { id: roomId },
  });
}

export const roomsRepository = {
  findRoom,
};
