"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.someSchema = void 0;
var mini_1 = require("zod/mini");
exports.someSchema = mini_1.z.object({
    test: mini_1.z.string(),
});
