"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleWare = authMiddleWare;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authMiddleWare(req, res, next) {
    var _a;
    const authHeader = (_a = req.header("Authorization")) !== null && _a !== void 0 ? _a : "";
    console.log(process.env.JWT_SECRET, authHeader);
    try {
        // @ts-ignore
        const decoded = jsonwebtoken_1.default.verify(authHeader, process.env.JWT_SECRET);
        if (decoded.userId) {
            //@ts-ignore
            req.userId = decoded.userId;
            return next();
        }
        else {
            res.status(403).json({
                msg: "You are not logged in"
            });
        }
    }
    catch (err) {
        console.log(err.message);
        res.status(404).json({
            msg: "You are not authorized for this task"
        });
    }
}
