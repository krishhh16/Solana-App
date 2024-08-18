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
const route = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
route.post('/v1/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const walletAddress = "AChE4XuUi4SEh7zSZj25mcEFWwWmiESJDoC3Hoy6kj37";
    const existingUser = yield prisma.user.findFirst({
        where: { address: walletAddress }
    });
    if (existingUser) {
        const token = jsonwebtoken_1.default.sign({
            address: walletAddress
        }, "Some secret key");
        res.json({ token });
    }
    else {
        yield prisma.user.create({
            data: {
                address: walletAddress
            }
        });
        const token = jsonwebtoken_1.default.sign({
            address: walletAddress
        }, "Some secret key");
        res.json({ token });
    }
}));
exports.default = route;
