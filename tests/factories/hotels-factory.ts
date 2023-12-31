import faker from '@faker-js/faker';
import { TicketStatus } from '@prisma/client';
import { generateValidToken } from '../helpers';
import { createUser } from './users-factory';
import { createEnrollmentWithAddress } from './enrollments-factory';
import { createTicket, createTicketType } from './tickets-factory';
import { prisma } from '@/config';

export async function createHotel() {
  return await prisma.hotel.create({
    data: {
      name: faker.name.findName(),
      image: faker.image.imageUrl(),
    },
  });
}

export async function createRoomWithHotelId(hotelId: number) {
  return prisma.room.create({
    data: {
      name: '1020',
      capacity: 3,
      hotelId: hotelId,
    },
  });
}

export async function createHotelWithContext(
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

  return {
    user,
    token,
    enrollment,
    ttype,
    ticket,
    hotel,
  };
}
