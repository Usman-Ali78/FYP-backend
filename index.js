require("dotenv").config();
const express = require("express");
const { ngoRouter } = require("./routes/ngoRouter");
const { restaurantRouter } = require("./routes/restaurantRouter");
const { mongoConnect } = require("./Database/database");
const { authRouter } = require("./routes/authRoutes");
const { adminRouter } = require("./routes/adminRouter");
const donationRouter = require("./routes/donationRouter");
const userRouter = require("./routes/userRouter");

const app = express();

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define API routes with prefixes
app.use("/api", adminRouter);
app.use("/api", ngoRouter);
app.use("/api", restaurantRouter);
app.use("/api", authRouter);
app.use("/api", donationRouter); 
app.use("/api", userRouter); 

const PORT = process.env.PORT || 3000;

mongoConnect(() => {
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
});
