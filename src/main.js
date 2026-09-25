
import "./common/db/db.js";
import express from "express";
import Otp from "./app/auth/model/Otp.model.js";
import userRouter from "./app/user/route/user.route.js";
const app = express();

app.use(express.json());
app.use('/user', userRouter);
app.use((err, req, res, next) => {
    res.json({
        message: err,
        success: false,
        stack: err.stack,// file name and line number
    })
})
app.listen(3000, () => {
    console.log(`http://localhost:3000`);
});

