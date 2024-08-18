"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const middlewares_1 = require("./middlewares");
const route = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
route.post('/v1/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const walletAddress = "AChE4XuUi4SEh7zSZj25mcEFWwWmiESJDoC3Hoy6kj37";
    const existingUser = yield prisma.worker.findFirst({
        where: { address: walletAddress }
    });
    if (existingUser) {
        const token = jsonwebtoken_1.default.sign({
            userId: existingUser.id
            //@ts-ignore
        }, process.env.JWT_SECRET_WORKER);
        res.json({
            token
        });
    }
    else {
        const someUser = yield prisma.worker.create({
            data: {
                address: walletAddress,
                pendingAmount: 0,
                lockedAmount: 0
            }
        });
        const token = jsonwebtoken_1.default.sign({
            userId: someUser.id
            //@ts-ignore
        }, process.env.JWT_SECRET_WORKER);
        res.json({
            token
        });
    }
}));
route.get("/v1/nextTasks", middlewares_1.authMiddleWareWorkers, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.userId;
    console.log(userId);
    const tasks = yield prisma.task.findFirst({
        where: {
            submissions: {
                none: {
                    worker_id: userId,
                }
            },
            done: false
        },
        select: {
            title: true,
            options: true
        }
    });
    console.log(tasks);
    if (!tasks) {
        res.json({
            msg: "You do not have any taskss left anymore"
        });
    }
    else {
        res.json({
            tasks
        });
    }
}));
exports.default = route;
