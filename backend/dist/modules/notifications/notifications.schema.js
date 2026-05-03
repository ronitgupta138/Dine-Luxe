"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDeviceSchema = void 0;
const zod_1 = require("zod");
exports.registerDeviceSchema = zod_1.z.object({
    body: zod_1.z.object({
        token: zod_1.z.string().min(10),
        platform: zod_1.z.enum(['ios', 'android', 'web']).optional(),
    }),
});
//# sourceMappingURL=notifications.schema.js.map