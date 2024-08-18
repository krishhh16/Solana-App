import { NextFunction, Response, Request } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"

export function authMiddleWare(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.header("Authorization") ?? "";

    try {
        // @ts-ignore
        const decoded = jwt.verify(authHeader, process.env.JWT_SECRET) as JwtPayload;
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