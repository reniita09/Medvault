import express from "express";
import cors from 'cors';
import 'dotenv/config';
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import adminRouter from "./routes/adminRoute.js";
import medicalRoutes from "./routes/medicalRoutes.js";


// app config
const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

// middlewares
app.use(express.json());  // Ensures JSON body parsing
app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }));

// api endpoints
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/medical-records", medicalRoutes);
//app.use("/api/medical-records2", medicalRoutes);
//app.use("/api/generatetoken", medicalRoutes);

app.use(express.urlencoded({ extended: true })); // Handle form data (optional but useful for POST requests with form data)

// Home endpoint
app.get("/", (req, res) => {
  res.send("API Working");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server started on http://0.0.0.0:${port}`);
});
