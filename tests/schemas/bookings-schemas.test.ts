import faker from '@faker-js/faker';
import { bookingRoomidSchema, bookingidParamSchema } from '../../src/schemas/index';

describe('Booking Room id Schema', () => {
  it('When number is not valid, should return error', () => {
    const number = -1;
    const result = bookingRoomidSchema.validate(number);

    expect(result.error).toBeDefined();
  });

  it('When dont use number, should return error', () => {
    const number = faker.animal.cat();
    const result = bookingRoomidSchema.validate(number);

    expect(result.error).toBeDefined();
  });

  it('should return no error if input is valid', () => {
    const number = faker.random.numeric(3);
    const result = bookingRoomidSchema.validate(number);

    expect(result.error).toBeDefined();
  });
});

describe('Booking id params Schema', () => {
  it('When number is not valid, should return error', () => {
    const number = -1;
    const result = bookingidParamSchema.validate(number);

    expect(result.error).toBeDefined();
  });

  it('When dont use number, should return error', () => {
    const number = faker.animal.cat();
    const result = bookingidParamSchema.validate(number);

    expect(result.error).toBeDefined();
  });

  it('should return no error if input is valid', () => {
    const number = faker.random.numeric(3);
    const result = bookingidParamSchema.validate(number);

    expect(result.error).toBeDefined();
  });
});
