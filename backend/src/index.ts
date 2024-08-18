import express from "express";
import userRoute from "./routes/userRoutes";
import workerRoute from "./routes/workerRoutes";

const app = express();

app.use("/user", userRoute);
app.use("/worker", workerRoute);

app.listen(3001, () => {
    console.log('running the server on 3001')
})