import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { bookingsService } from '@/services/bookings-service';

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const result = await bookingsService.readBookings(userId);

  res.status(httpStatus.OK).send(result);
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body as { roomId: number };

  const result = await bookingsService.createBooking(userId, roomId);

  res.status(httpStatus.OK).send(result);
}

export async function putBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body as { roomId: number };
  const { bookingId } = req.params;

  const parsedBookingId = parseInt(bookingId);

  const result = await bookingsService.swapBookings(userId, roomId, parsedBookingId);

  res.status(httpStatus.OK).send(result);
}
