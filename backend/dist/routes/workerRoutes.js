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
exports.TOTAL_DECIMALS = void 0;
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const middlewares_1 = require("./middlewares");
const db_1 = require("../db");
const types_1 = require("../types/types");
const route = (0, express_1.Router)();
exports.TOTAL_DECIMALS = 100000000;
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
    const tasks = yield (0, db_1.getTasks)(userId);
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
route.post("/submission", middlewares_1.authMiddleWareWorkers, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    //@ts-ignore
    const userId = req.userId;
    console.log(body);
    const parsedData = types_1.submissionUserInput.safeParse(body);
    if (parsedData.success) {
        const tasks = yield (0, db_1.getTasks)(userId);
        if (!tasks || (tasks === null || tasks === void 0 ? void 0 : tasks.id) !== Number(parsedData.data.taskId)) { // Why're we using hte tasks.id's comparision with the provided taskId? isn't tasks going to be the first tasks
            return res.status(411).json({
                msg: "incorrect taskId"
            });
        }
        const amount = (Number(tasks.amount) / 100);
        const submission = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const submission = yield tx.sumbissions.create({
                data: {
                    option_id: Number(parsedData.data.selection),
                    worker_id: userId,
                    task_id: Number(parsedData.data.taskId),
                    amount
                }
            });
            yield tx.worker.update({
                where: {
                    id: userId
                },
                data: {
                    pendingAmount: {
                        increment: Number(amount)
                    }
                }
            });
            return submission;
        }));
        const nextTask = (0, db_1.getTasks)(userId);
        res.status(200).json({
            nextTask,
            amount
        });
    }
    else {
        res.status(401).json({
            msg: "Invalid user inputs"
        });
    }
}));
route.get("/balance", middlewares_1.authMiddleWareWorkers, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const userId = req.userId;
    const worker = yield prisma.worker.findFirst({
        where: {
            id: Number(userId)
        }
    });
    res.json({
        pendingAmount: worker === null || worker === void 0 ? void 0 : worker.pendingAmount,
        lockedAmount: worker === null || worker === void 0 ? void 0 : worker.lockedAmount
    });
}));
route.post("/payout", middlewares_1.authMiddleWareWorkers, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore 
    const userId = req.userId;
    const worker = yield prisma.worker.findFirst({
        where: { id: Number(userId) }
    });
    if (!worker) {
        res.json({
            msg: "Invalid worker"
        });
    }
    const address = worker === null || worker === void 0 ? void 0 : worker.address;
    const txnId = "0x5555";
    yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        yield tx.worker.update({
            where: {
                id: userId
            },
            data: {
                pendingAmount: {
                    decrement: worker === null || worker === void 0 ? void 0 : worker.pendingAmount
                },
                lockedAmount: {
                    increment: worker === null || worker === void 0 ? void 0 : worker.lockedAmount
                }
            }
        });
        yield tx.payout.create({
            data: {
                userId,
                amount: worker === null || worker === void 0 ? void 0 : worker.pendingAmount,
                status: "Processing",
                signature: txnId,
            }
        });
    }));
    res.json({
        msg: "Processing Payout",
        amount: worker === null || worker === void 0 ? void 0 : worker.pendingAmount
    });
}));
exports.default = route;
