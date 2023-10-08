import supertest from 'supertest';
import httpStatus from 'http-status';
import { cleanDb, generateValidToken } from '../helpers';
import { verbs } from '../test-protocols';
import { createBooking, createBookingWithContext } from '../factories/booking-factory';
import { createRoomWithHotelId } from '../factories/hotels-factory';
import app, { init } from '@/app';
import { prisma } from '@/config';
import { createUser } from '@/services';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe.each([
  [verbs.get, '/booking', ''],
  [verbs.post, '/booking', ''],
  [verbs.put, '/booking', 1],
])('%s %s >>> Check if route authentication returns 401 to requests without token', (verb: verbs, endpoint, param) => {
  it('should respond 200 if all pre-requisites are met', async () => {
    const url = `${endpoint}/${param}`;
    const response = await server[verb](url);
    expect(response.statusCode).toBe(httpStatus.UNAUTHORIZED);
  });
});

describe('GET /booking', () => {
  it('should respond with status 200 if user have a booking', async () => {
    const context = await createBookingWithContext();

    const result = await server.get('/booking').set('Authorization', `Bearer ${context.token}`);

    expect(result.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        Room: expect.arrayContaining([
          {
            id: expect.any(Number),
            hotelId: expect.any(Number),
            createdAt: expect.any(Date),
            capacity: expect.any(Number),
          },
        ]),
      }),
    );
    expect(result.statusCode).toBe(httpStatus.OK);
  });

  it('should respond with status 404 if user DOESNT have a booking', async () => {
    const token = generateValidToken();
    const result = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(result.statusCode).toBe(httpStatus.NOT_FOUND);
  });
});

describe('POST /booking', () => {
  it('should respond with status 200 and booking id if user have paid presencial ticket with hotel', async () => {
    const context = await createBookingWithContext();

    const result = await server
      .post('/booking')
      .set('Authorization', `Bearer ${context.token}`)
      .send({ roomId: context.room.id });

    expect(result.body).toEqual(
      expect.objectContaining({
        bookingId: expect.any(Number),
      }),
    );

    expect(result.statusCode).toBe(httpStatus.OK);
  });

  it('should respond with status 404 if room doesnt exist', async () => {
    const context = await createBookingWithContext();

    const result = await server
      .post('/booking')
      .set('Authorization', `Bearer ${context.token}`)
      .send({ roomId: 808080 });

    expect(result.statusCode).toBe(httpStatus.NOT_FOUND);
  });

  it('should respond with status 403 if room is at full capacity', async () => {
    const context = await createBookingWithContext();
    await prisma.booking.delete({ where: { id: context.booking.id } });

    const user1 = await createUser({ email: 'teste@gmail.com', password: 'teste' });
    const user2 = await createUser({ email: 'teste@yahoo.com', password: 'teste' });
    const user3 = await createUser({ email: 'teste@hotmail.com', password: 'teste' });
    await createBooking(user1.id, context.room.id);
    await createBooking(user2.id, context.room.id);
    await createBooking(user3.id, context.room.id);

    const result = await server
      .post('/booking')
      .set('Authorization', `Bearer ${context.token}`)
      .send({ roomId: context.room.id });

    expect(result.statusCode).toBe(httpStatus.FORBIDDEN);
  });

  it('should respond with status 403 if ticket type is remote', async () => {
    const context = await createBookingWithContext('PAID', true, true);

    const result = await server
      .post('/booking')
      .set('Authorization', `Bearer ${context.token}`)
      .send({ roomId: context.room.id });

    expect(result.statusCode).toBe(httpStatus.FORBIDDEN);
  });

  it('should respond with status 403 if ticket type doesnt have hotel', async () => {
    const context = await createBookingWithContext('PAID', false, false);

    const result = await server
      .post('/booking')
      .set('Authorization', `Bearer ${context.token}`)
      .send({ roomId: context.room.id });

    expect(result.statusCode).toBe(httpStatus.FORBIDDEN);
  });

  it('should respond with status 403 if ticket arent paid', async () => {
    const context = await createBookingWithContext('RESERVED', true, false);

    const result = await server
      .post('/booking')
      .set('Authorization', `Bearer ${context.token}`)
      .send({ roomId: context.room.id });

    expect(result.statusCode).toBe(httpStatus.FORBIDDEN);
  });
});

describe('PUT /booking', () => {
  it('should respond with status 200 and bookingId if everything correct', async () => {
    const context = await createBookingWithContext('PAID', true, false);
    const newRoom = await createRoomWithHotelId(context.hotel.id);

    const result = await server
      .post(`/booking/${context.booking.id}`)
      .set('Authorization', `Bearer ${context.token}`)
      .send({ roomId: newRoom.id });

    expect(result.statusCode).toBe(httpStatus.OK);
  });

  it('should respond with status 403 if user doesnt have a booking', async () => {
    const context = await createBookingWithContext('PAID', true, false);
    await prisma.booking.deleteMany({});
    const newRoom = await createRoomWithHotelId(context.hotel.id);

    const result = await server
      .post(`/booking/${context.booking.id}`)
      .set('Authorization', `Bearer ${context.token}`)
      .send({ roomId: newRoom.id });

    expect(result.statusCode).toBe(httpStatus.FORBIDDEN);
  });

  it('should respond with status 403 if new room is at full capacity', async () => {
    const context = await createBookingWithContext('PAID', true, false);

    const newRoom = await createRoomWithHotelId(context.hotel.id);

    const user1 = await createUser({ email: 'teste@gmail.com', password: 'teste' });
    const user2 = await createUser({ email: 'teste@yahoo.com', password: 'teste' });
    const user3 = await createUser({ email: 'teste@hotmail.com', password: 'teste' });
    await createBooking(user1.id, newRoom.id);
    await createBooking(user2.id, newRoom.id);
    await createBooking(user3.id, newRoom.id);

    const result = await server
      .post(`/booking/${context.booking.id}`)
      .set('Authorization', `Bearer ${context.token}`)
      .send({ roomId: newRoom.id });

    expect(result.statusCode).toBe(httpStatus.FORBIDDEN);
  });

  it('should respond with status 404 if new room doesnt exist', async () => {
    const context = await createBookingWithContext('PAID', true, false);

    const result = await server
      .post(`/booking/${context.booking.id}`)
      .set('Authorization', `Bearer ${context.token}`)
      .send({ roomId: 808080 });

    expect(result.body).toEqual(
      expect.objectContaining({
        bookingId: expect.any(Number),
      }),
    );
    expect(result.statusCode).toBe(httpStatus.NOT_FOUND);
  });
});
