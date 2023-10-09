import Joi from "joi";

export const bookingRoomidSchema= Joi.object({
    roomId: Joi.number().positive().integer().allow(0).required();
});

export const bookingidParamSchema= Joi.object({
    bookingId: Joi.number().positive().integer().allow(0).required();
});
