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
const client_s3_1 = require("@aws-sdk/client-s3");
const middlewares_1 = require("./middlewares");
const client_1 = require("@prisma/client");
const s3_presigned_post_1 = require("@aws-sdk/s3-presigned-post");
const types_1 = require("../types/types");
const workerRoutes_1 = require("./workerRoutes");
const web3_js_1 = require("@solana/web3.js");
const tweetnacl_1 = __importDefault(require("tweetnacl"));
const connection = new web3_js_1.Connection("https://solana-devnet.g.alchemy.com/v2/mSOKolKC5DWNK9KeMWIEoN9TxSNWspzy");
const route = (0, express_1.Router)();
//@ts-ignore
const s3Client = new client_s3_1.S3Client({
    credentials: {
        accessKeyId: process.env.AMAZON_ACCESS_KEY,
        secretAccessKey: process.env.AMAZON_SECRET_KEY
    },
    region: "eu-north-1"
});
const prisma = new client_1.PrismaClient();
route.post('/v1/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { publicKey, signature } = req.body;
    try {
        console.log(signature);
        const signatureString = "You're a verified exceliWorker";
        const stringEncoded = new TextEncoder().encode(signatureString);
        const sign = new Uint8Array(Object.values(signature));
        const pubkey = new web3_js_1.PublicKey(publicKey).toBytes();
        const result = tweetnacl_1.default.sign.detached.verify(stringEncoded, sign, pubkey);
        if (!result) {
            return res.status(401).json({
                msg: "Invalid User"
            });
        }
    }
    catch (err) {
        console.log(err);
        return res.json({
            msg: "Bad signature"
        });
    }
    const existingUser = yield prisma.user.findFirst({
        where: { address: publicKey }
    });
    if (existingUser) {
        const token = jsonwebtoken_1.default.sign({
            userId: existingUser.id
            //@ts-ignore
        }, process.env.JWT_SECRET_USER);
        res.json({
            token
        });
    }
    else {
        const someUser = yield prisma.user.create({
            data: {
                address: publicKey
            }
        });
        const token = jsonwebtoken_1.default.sign({
            userId: someUser.id
            //@ts-ignore
        }, process.env.JWT_SECRET_USER);
        res.json({
            token
        });
    }
}));
route.get("/v1/getPresignedUrl", middlewares_1.authMiddleWareUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.userId;
    const { url, fields } = yield (0, s3_presigned_post_1.createPresignedPost)(s3Client, {
        Bucket: "decentralized-feverrr",
        Key: `images/${userId}/${Math.random()}/image.jpg`,
        Conditions: [
            ["content-length-range", 0, 5 * 1024 * 1024] // 5 mb max
        ],
        Fields: {
            "Content-Type": 'image/jpg'
        },
        Expires: 3600
    });
    console.log(url, fields);
    res.json({
        preSignedUrl: url,
        fields
    });
}));
route.post("/v1/task", middlewares_1.authMiddleWareUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    const body = req.body;
    // @ts-ignore
    const userId = req.userId;
    console.log(userId);
    const parseData = types_1.taskUserInput.safeParse(body);
    if (!parseData.success) {
        res.json({
            msg: "Invalid input type"
        });
    }
    const transaction = yield connection.getTransaction((_a = parseData.data) === null || _a === void 0 ? void 0 : _a.signature, {
        maxSupportedTransactionVersion: 1
    });
    if (((_c = (_b = transaction === null || transaction === void 0 ? void 0 : transaction.meta) === null || _b === void 0 ? void 0 : _b.postBalances[1]) !== null && _c !== void 0 ? _c : 0) - ((_e = (_d = transaction === null || transaction === void 0 ? void 0 : transaction.meta) === null || _d === void 0 ? void 0 : _d.preBalances[1]) !== null && _e !== void 0 ? _e : 0) !== 100000000) {
        return res.status(411).json({
            msg: "Transaction signature/amount incorrect"
        });
    }
    if (((_f = transaction === null || transaction === void 0 ? void 0 : transaction.transaction.message.getAccountKeys().get(1)) === null || _f === void 0 ? void 0 : _f.toString()) !== "AChE4XuUi4SEh7zSZj25mcEFWwWmiESJDoC3Hoy6kj37") {
        return res.status(411).json({
            msg: "Transaction sent to wrong address"
        });
    }
    const respone = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const response = yield tx.task.create({
            data: {
                title: "Click on the most clickable thumbnail",
                amount: 1 * workerRoutes_1.TOTAL_DECIMALS,
                signature: ((_a = parseData.data) === null || _a === void 0 ? void 0 : _a.signature) || "signature",
                userId,
            }
        });
        yield tx.option.createMany({
            //@ts-ignore Need to take care of it
            data: (_b = parseData.data) === null || _b === void 0 ? void 0 : _b.options.map(x => ({
                image_url: x.imageUrl,
                taskId: response.id
            }))
        });
        return response;
    }));
    res.json({
        id: respone.id
    });
}));
route.get('/task', middlewares_1.authMiddleWareUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const taskId = req.query.taskId;
    // @ts-ignore
    const userId = req.userId;
    // Find the first task with the provided taskId and only include the options parameter
    const taskDetails = yield prisma.task.findFirst({
        where: {
            userId: Number(userId),
            id: Number(taskId)
        },
        include: {
            options: true
        }
    });
    // Get all the submissions for the specified task_id and include the option
    const response = yield prisma.sumbissions.findMany({
        where: {
            task_id: Number(taskId)
        },
        include: {
            option: true
        }
    });
    const result = {};
    taskDetails === null || taskDetails === void 0 ? void 0 : taskDetails.options.forEach(option => {
        result[option.id] = {
            count: 0,
            tasks: {
                imageUrl: option.image_url
            }
        };
    });
    response.forEach(r => {
        result[r.option_id].count++;
    });
    console.log(result);
    res.json({
        result,
        taskDetails
    });
}));
exports.default = route;
