"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkArrival = checkArrival;
const zod_1 = require("zod");
const response_1 = require("../../utils/response");
const geo_service_1 = require("./geo.service");
const arrivalCheckSchema = zod_1.z.object({
    lat: zod_1.z.number().min(-90).max(90),
    lon: zod_1.z.number().min(-180).max(180),
    bookingId: zod_1.z.string().uuid(),
});
async function checkArrival(req, res, next) {
    try {
        const parsed = arrivalCheckSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json((0, response_1.error)('VALIDATION_ERROR', 'Validation failed'));
        }
        const data = await (0, geo_service_1.arrivalCheck)(parsed.data, req.user.id);
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        if (err.statusCode)
            return res.status(err.statusCode).json((0, response_1.error)('GEO_ERROR', err.message));
        next(err);
    }
}
//# sourceMappingURL=geo.controller.js.map