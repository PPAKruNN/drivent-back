import { Room, Ticket } from '@prisma/client';
import { TicketMock } from '../factories';
import { cleanDb } from '../helpers';
import { bookingsRepository } from '@/repositories/bookings-repository';
import { init } from '@/app';
import { roomsRepository } from '@/repositories/rooms-repository';
import { ticketsRepository } from '@/repositories';
import { bookingsService } from '../../src/services/bookings-service';
import { ForbiddenActionError, cannotJoinFullRoom, notFoundError } from '@/errors';

beforeAll(async () => {
  await init();
  await cleanDb();
});

describe('Create booking', () => {
  it('should return booking id if everything okay!', async () => {
    jest.spyOn(roomsRepository, 'findRoom').mockImplementationOnce(async (_id: number) => {
      return { capacity: 3, createdAt: new Date(), hotelId: 1000, id: 1, name: 'tantofaz', updatedAt: new Date() };
    });

    jest.spyOn(bookingsRepository, 'countBookingsOnRoom').mockImplementationOnce(async (_id: number) => 1);
    jest.spyOn(bookingsRepository, 'createBooking').mockImplementationOnce(async (_userid: number, _roomid: number) => {
      return { id: 999 };
    });
    jest.spyOn(ticketsRepository, 'findTicketByUserId').mockImplementationOnce(TicketMock());

    const result = await bookingsService.createBooking(1, 1);
    expect(result).toMatchObject({ bookingId: 999 });
  });

  it('should throw cannotjoinfullroom error if room is full', async () => {
    jest.spyOn(roomsRepository, 'findRoom').mockImplementationOnce(async (_id: number) => {
      return { capacity: 3, createdAt: new Date(), hotelId: 1000, id: 1, name: 'tantofaz', updatedAt: new Date() };
    });
    jest.spyOn(bookingsRepository, 'countBookingsOnRoom').mockImplementationOnce(async (_id: number) => 3);

    try {
      await bookingsService.createBooking(1, 1);
      fail('should throw CannotJoinFullRoom');
    } catch (error) {
      expect(error).toEqual(cannotJoinFullRoom());
    }
  });
  it('should throw NotFound error if room does not exist', async () => {
    jest.spyOn(roomsRepository, 'findRoom').mockImplementationOnce(async (_id: number) => {
      return undefined;
    });

    try {
      await bookingsService.createBooking(1, 1);
      fail('should throw NotFoundError');
    } catch (error) {
      expect(error).toEqual(notFoundError());
    }
  });
  it('should throw ForbiddenAction error if ticket not exist', async () => {
    jest.spyOn(roomsRepository, 'findRoom').mockImplementationOnce(async (_id: number) => {
      return { capacity: 3, createdAt: new Date(), hotelId: 1000, id: 1, name: 'tantofaz', updatedAt: new Date() };
    });

    jest.spyOn(bookingsRepository, 'countBookingsOnRoom').mockImplementationOnce(async (_id: number) => 1);

    jest.spyOn(ticketsRepository, 'findTicketByUserId').mockImplementationOnce(async (_userId: number) => undefined);

    jest.spyOn(bookingsRepository, 'createBooking').mockImplementationOnce(async (_userid: number, _roomid: number) => {
      return { id: 999 };
    });

    try {
      await bookingsService.createBooking(1, 1);
      fail('should throw ForbiddenActionError');
    } catch (error) {
      expect(error).toEqual(ForbiddenActionError('Non-existing ticket', 'book a room'));
    }
  });
  it('should throw ForbiddenAction error if ticket is not paid', async () => {
    jest.spyOn(roomsRepository, 'findRoom').mockImplementationOnce(async (_id: number) => {
      return { capacity: 3, createdAt: new Date(), hotelId: 1000, id: 1, name: 'tantofaz', updatedAt: new Date() };
    });

    jest.spyOn(bookingsRepository, 'countBookingsOnRoom').mockImplementationOnce(async (_id: number) => 1);

    jest.spyOn(ticketsRepository, 'findTicketByUserId').mockImplementationOnce(TicketMock('RESERVED'));

    jest.spyOn(bookingsRepository, 'createBooking').mockImplementationOnce(async (_userid: number, _roomid: number) => {
      return { id: 999 };
    });

    try {
      await bookingsService.createBooking(1, 1);
      fail('should throw ForbiddenActionError');
    } catch (error) {
      expect(error).toEqual(ForbiddenActionError('Non-paid ticket', 'book a room'));
    }
  });

  it('should throw ForbiddenAction error if ticket doesnt have a hotel', async () => {
    jest.spyOn(roomsRepository, 'findRoom').mockImplementationOnce(async (_id: number) => {
      return { capacity: 3, createdAt: new Date(), hotelId: 1000, id: 1, name: 'tantofaz', updatedAt: new Date() };
    });

    jest.spyOn(bookingsRepository, 'countBookingsOnRoom').mockImplementationOnce(async (_id: number) => 1);

    jest.spyOn(ticketsRepository, 'findTicketByUserId').mockImplementationOnce(TicketMock('PAID', false));

    jest.spyOn(bookingsRepository, 'createBooking').mockImplementationOnce(async (_userid: number, _roomid: number) => {
      return { id: 999 };
    });

    try {
      await bookingsService.createBooking(1, 1);
      fail('should throw ForbiddenActionError');
    } catch (error) {
      expect(error).toEqual(ForbiddenActionError('Ticket without hotel', 'book a room'));
    }
  });
  it('should throw ForbiddenAction error if ticket is remote', async () => {
    jest.spyOn(roomsRepository, 'findRoom').mockImplementationOnce(async (_id: number) => {
      return { capacity: 3, createdAt: new Date(), hotelId: 1000, id: 1, name: 'tantofaz', updatedAt: new Date() };
    });

    jest.spyOn(bookingsRepository, 'countBookingsOnRoom').mockImplementationOnce(async (_id: number) => 1);

    jest.spyOn(ticketsRepository, 'findTicketByUserId').mockImplementationOnce(TicketMock('PAID', true, true));

    jest.spyOn(bookingsRepository, 'createBooking').mockImplementationOnce(async (_userid: number, _roomid: number) => {
      return { id: 999 };
    });

    try {
      await bookingsService.createBooking(1, 1);
      fail('should throw ForbiddenActionError');
    } catch (error) {
      expect(error).toEqual(ForbiddenActionError('Remote ticket', 'book a room'));
    }
  });
});

describe('Read booking', () => {
  it('should not throw errors if everything is okay!', async () => {
    const date = new Date();
    jest.spyOn(bookingsRepository, 'findBookingByUser').mockImplementationOnce(async (_id) => {
      return {
        capacity: 3,
        createdAt: date,
        hotelId: 1,
        id: 100,
        name: 'gregorio',
        updatedAt: date,
      };
    });

    const result = await bookingsService.readBookings(1);
    expect(result).toMatchObject({
      capacity: 3,
      createdAt: date,
      hotelId: 1,
      id: 100,
      name: 'gregorio',
      updatedAt: date,
    });
  });

  it('should throw NotFound error if ticket doesnt exist', async () => {
    jest.spyOn(bookingsRepository, 'findBookingByUser').mockImplementationOnce(async (_id) => undefined);

    try {
      await bookingsService.createBooking(1, 1);
      fail('should throw NotFoundError');
    } catch (error) {
      expect(error).toEqual(notFoundError());
    }
  });
});

describe('Swap Rooms', () => {
  it('should not throw errors if everything is okay!', async () => {
    jest.spyOn(bookingsRepository, 'deleteBooking').mockImplementation(async (_roomId: number) => undefined);
    jest.spyOn(roomsRepository, 'findRoom').mockImplementationOnce(async (_id: number) => {
      return { capacity: 3, createdAt: new Date(), hotelId: 1000, id: 1, name: 'tantofaz', updatedAt: new Date() };
    });
    jest.spyOn(bookingsRepository, 'countBookingsOnRoom').mockImplementationOnce(async (_id: number) => 1);
    const date = new Date();
    jest.spyOn(bookingsRepository, 'findBookingById').mockImplementationOnce(async (_id) => {
      return {
        capacity: 3,
        createdAt: date,
        hotelId: 1,
        id: 100,
        name: 'gregorio',
        updatedAt: date,
      };
    });
    jest.spyOn(bookingsRepository, 'createBooking').mockImplementationOnce(async (_userid: number, _roomid: number) => {
      return { id: 999 };
    });

    const result = await bookingsService.swapBookings(1, 20, 32);
    expect(result).toMatchObject({ bookingId: 999 });
  });

  it('should throw ForbiddenAction error if user booking does not exists!', async () => {
    jest.spyOn(bookingsRepository, 'findBookingById').mockImplementationOnce(async (_id) => undefined);

    try {
      await bookingsService.swapBookings(1, 20, 32);
      fail('should throw ForbiddenAction');
    } catch (error) {
      expect(error).toEqual(ForbiddenActionError('No Booking', 'Swap bookings'));
    }
  });
  it('should throw CannotJoinFullRoom error if target room is full!', async () => {
    jest.spyOn(roomsRepository, 'findRoom').mockImplementationOnce(async (_id: number) => {
      return { capacity: 3, createdAt: new Date(), hotelId: 1000, id: 1, name: 'tantofaz', updatedAt: new Date() };
    });
    jest.spyOn(bookingsRepository, 'countBookingsOnRoom').mockImplementationOnce(async (_id: number) => 3);
    const date = new Date();
    jest.spyOn(bookingsRepository, 'findBookingById').mockImplementationOnce(async (_id) => {
      return {
        capacity: 3,
        createdAt: date,
        hotelId: 1,
        id: 100,
        name: 'gregorio',
        updatedAt: date,
      };
    });

    try {
      await bookingsService.swapBookings(1, 20, 32);
      fail('should throw CannotJoinFullRoom');
    } catch (error) {
      expect(error).toEqual(cannotJoinFullRoom());
    }
  });
  it('should throw NotFound error if target room does not exists!', async () => {
    jest.spyOn(roomsRepository, 'findRoom').mockImplementationOnce(async (_id: number) => {
      return undefined;
    });
    const date = new Date();
    jest.spyOn(bookingsRepository, 'findBookingById').mockImplementationOnce(async (_id) => {
      return {
        capacity: 3,
        createdAt: date,
        hotelId: 1,
        id: 100,
        name: 'gregorio',
        updatedAt: date,
      };
    });

    try {
      await bookingsService.swapBookings(1, 20, 32);
      fail('should throw NotFoundError');
    } catch (error) {
      expect(error).toEqual(notFoundError());
    }
  });
});
