import { Address, Enrollment, Hotel, Room, Ticket, TicketType, User } from '@prisma/client';

export type FullUser = {
  user: User;
  token: string;
  enrollment: Enrollment & { Address: Address[] };
  hotel: Hotel & { Rooms: Room[] };
  ticket: Ticket;
  ticketType: TicketType;
};
