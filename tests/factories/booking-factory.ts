import { TicketStatus } from '@prisma/client';
import { generateValidToken } from '../helpers';
import { createUser } from './users-factory';
import { createEnrollmentWithAddress } from './enrollments-factory';
import { createTicket, createTicketType } from './tickets-factory';
import { createHotel, createRoomWithHotelId } from './hotels-factory';
import { prisma } from '@/config';

export async function createBooking(userId: number, roomId: number) {
  return await prisma.booking.create({
    data: {
      userId,
      roomId,
    },
  });
}

export async function createBookingWithContext(
  ticketStat: TicketStatus = TicketStatus.PAID,
  ttHaveHotel = true,
  ttIsRemote = false,
) {
  const user = await createUser();
  const token = await generateValidToken(user);
  const enrollment = await createEnrollmentWithAddress(user);
  const ttype = await createTicketType(ttIsRemote, ttHaveHotel);
  const ticket = await createTicket(enrollment.id, ttype.id, ticketStat);
  const hotel = await createHotel();
  const room = await createRoomWithHotelId(hotel.id);
  const booking = await createBooking(user.id, room.id);

  return {
    user,
    token,
    enrollment,
    ttype,
    ticket,
    hotel,
    room,
    booking,
  };
}
