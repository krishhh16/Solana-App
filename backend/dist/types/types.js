"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submissionUserInput = exports.taskUserInput = void 0;
const zod_1 = __importDefault(require("zod"));
exports.taskUserInput = zod_1.default.object({
    options: zod_1.default.array(zod_1.default.object({
        imageUrl: zod_1.default.string()
    })).min(2),
    title: zod_1.default.string().optional(),
    signature: zod_1.default.string()
});
exports.submissionUserInput = zod_1.default.object({
    taskId: zod_1.default.string(),
    selection: zod_1.default.string()
});
