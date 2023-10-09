import { Router } from 'express';
import { authenticateToken, validateBody, validateParams } from '@/middlewares';
import { bookingRoomidSchema, bookingidParamSchema } from '@/schemas';
import { getBooking, postBooking, putBooking } from '@/controllers/bookings-controller';

const bookingsRouter = Router();

bookingsRouter
  .all('/*', authenticateToken)
  .get('/', getBooking)
  .post('/', validateBody(bookingRoomidSchema), postBooking)
  .put('/:bookingId', validateParams(bookingidParamSchema), validateBody(bookingRoomidSchema), putBooking);

export { bookingsRouter };
