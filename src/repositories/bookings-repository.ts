import { prisma } from '@/config';

async function findBookingByUser(userId: number) {
  return await prisma.booking.findUnique({
    where: { userId },
    select: { id: true, Room: true },
  });
}

async function findBookingById(id: number) {
  return await prisma.booking.findUnique({
    where: { id },
    select: { id: true, Room: true },
  });
}

async function createBooking(userId: number, roomId: number) {
  return await prisma.booking.create({
    data: { roomId, userId },
    select: { id: true },
  });
}

async function deleteBooking(roomId: number) {
  await prisma.booking.delete({ where: { id: roomId } });
}

async function countBookingsOnRoom(roomId: number) {
  return await prisma.booking.count({ where: { roomId } });
}

export const bookingsRepository = {
  findBookingByUser,
  findBookingById,
  deleteBooking,
  createBooking,
  countBookingsOnRoom,
};
