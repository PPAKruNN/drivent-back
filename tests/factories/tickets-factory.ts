import faker from '@faker-js/faker';
import { Ticket, TicketStatus, TicketType } from '@prisma/client';
import { prisma } from '@/config';

export async function createTicketType(isRemote?: boolean, includesHotel?: boolean) {
  return prisma.ticketType.create({
    data: {
      name: faker.name.findName(),
      price: faker.datatype.number(),
      isRemote: isRemote !== undefined ? isRemote : faker.datatype.boolean(),
      includesHotel: includesHotel !== undefined ? includesHotel : faker.datatype.boolean(),
    },
  });
}

export async function createTicket(enrollmentId: number, ticketTypeId: number, status: TicketStatus) {
  return prisma.ticket.create({
    data: {
      enrollmentId,
      ticketTypeId,
      status,
    },
  });
}

export function TicketMock(status: TicketStatus = TicketStatus.PAID, includesHotel = true, isRemote = false) {
  return async (id: number) => {
    const t: Ticket & { TicketType: TicketType } = {
      id: 1,
      createdAt: new Date(),
      enrollmentId: 1,
      status: status,
      ticketTypeId: 1,
      updatedAt: new Date(),
      TicketType: {
        id: 1,
        createdAt: new Date(),
        includesHotel: includesHotel,
        isRemote: isRemote,
        name: 'jureg',
        price: 5000,
        updatedAt: new Date(),
      },
    };

    return t;
  };
}
