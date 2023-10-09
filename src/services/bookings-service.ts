import { ForbiddenActionError, cannotJoinFullRoom, notFoundError } from '@/errors';
import { ticketsRepository } from '@/repositories';
import { bookingsRepository } from '@/repositories/bookings-repository';
import { roomsRepository } from '@/repositories/rooms-repository';

enum RoomState {
  FULL,
  INCOMPLETE,
}

async function checkRoomState(roomId: number): Promise<RoomState> {
  const room = await roomsRepository.findRoom(roomId);

  if (!room) throw notFoundError();
  const count = await bookingsRepository.countBookingsOnRoom(roomId);

  if (room.capacity === count) return RoomState.FULL;
  else return RoomState.INCOMPLETE;
}

async function checkTicketTypeCompatibility(userId: number) {
  const ticket = await ticketsRepository.findTicketByUserId(userId);

  if (!ticket) throw ForbiddenActionError('Non-existing ticket', 'book a room');
  if (ticket.status === 'RESERVED') throw ForbiddenActionError('Non-paid ticket', 'book a room');
  if (ticket.TicketType.isRemote === true) throw ForbiddenActionError('Remote ticket', 'book a room');
  if (ticket.TicketType.includesHotel === false) throw ForbiddenActionError('Ticket without hotel', 'book a room');
}

async function createBooking(userId: number, roomId: number) {
  const state = await checkRoomState(roomId);
  if (state === RoomState.FULL) throw cannotJoinFullRoom();
  await checkTicketTypeCompatibility(userId);

  const result = await bookingsRepository.createBooking(userId, roomId);
  const response = { bookingId: result.id };

  return response;
}

async function readBookings(userId: number) {
  const result = await bookingsRepository.findBookingByUser(userId);

  if (!result) throw notFoundError();

  return result;
}

async function swapBookings(userId: number, newRoom: number, originalRoom: number) {
  const booking = await bookingsRepository.findBookingById(originalRoom);
  if (!booking) throw ForbiddenActionError('No Booking', 'Swap bookings');

  const roomState = await checkRoomState(newRoom);
  if (roomState === RoomState.FULL) throw cannotJoinFullRoom();

  await bookingsRepository.deleteBooking(originalRoom);

  const result = await bookingsRepository.createBooking(userId, newRoom);
  const response = { bookingId: result.id };

  return response;
}

export const bookingsService = { createBooking, readBookings, swapBookings };
