import { NextFunction, Response, Request } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"

export function authMiddleWareUser(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.header("Authorization") ?? "";
    try {
        // @ts-ignore
        const decoded = jwt.verify(authHeader, process.env.JWT_SECRET_USER) as JwtPayload;
        if (decoded.userId) {
            //@ts-ignore
            req.userId = decoded.userId;
            return next();
        } else {
           
            res.status(403).json({
                msg: "You are not logged in"
            })
        }
    } catch (err: any) {
        console.log(err.message)
        res.status(404).json({
            msg: "You are not authorized for this task"
        })
    }

}
export function authMiddleWareWorkers(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.header("Authorization") ?? "";
    try {
        // @ts-ignore
        const decoded = jwt.verify(authHeader, process.env.JWT_SECRET_WORKER) as JwtPayload;
        if (decoded.userId) {
            //@ts-ignore
            req.userId = decoded.userId;
            return next();
        } else {
           
            res.status(403).json({
                msg: "You are not logged in"
            })
        }
    } catch (err: any) {
        console.log(err.message)
        res.status(404).json({
            msg: "You are not authorized for this task"
        })
    }

}