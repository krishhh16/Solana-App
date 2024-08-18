"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const workerRoutes_1 = __importDefault(require("./routes/workerRoutes"));
const app = (0, express_1.default)();
app.use("/user", userRoutes_1.default);
app.use("/worker", workerRoutes_1.default);
app.listen(3001, () => {
    console.log('running the server on 3001');
});
