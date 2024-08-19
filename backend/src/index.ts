import express from "express";
import userRoute from "./routes/userRoutes";
import workerRoute from "./routes/workerRoutes";
import cors from "cors"
const app = express();

app.use(express.json())
app.use(cors())


app.use("/user", userRoute);
app.use("/worker", workerRoute);

app.listen(3003, () => {
    console.log('running the server on 3003')
})