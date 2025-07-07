require("dotenv").config();
const express = require("express");
const { mongoConnect } = require("./Database/database");
const { authRouter } = require("./routes/authRouter");
const { adminRouter } = require("./routes/adminRouter");
const {donationRouter} = require("./routes/donationRouter");
const userRouter = require("./routes/userRouter");
const cors = require("cors");

const app = express();


// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: true, 
  credentials: true               
}));

// Define API routes with prefixes
app.use("/api/admin", adminRouter);
app.use("/api/auth", authRouter);
app.use("/api/donation", donationRouter); 
app.use("/api", userRouter); 

const PORT = process.env.PORT || 3000;

mongoConnect(() => {
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
});
