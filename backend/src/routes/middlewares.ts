import { NextFunction, Response, Request } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"

const JSON_SECRET = "Some secret key"
export function authMiddleWare(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.header("Authorization") ?? "";

    try {
        const decoded = jwt.verify(authHeader, JSON_SECRET) as JwtPayload;
        if (decoded.userId) {
            //@ts-ignore
            req.userId = decoded.userId;
            return next();
        } else {
            res.status(403).json({
                msg: "You are not logged in"
            })
        }
    } catch (err) {
        res.status(404).json({
            msg: "You are not authorized for this task"
        })
    }

}