const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URL = process.env.mongoUrl;
let db;

const mongoConnect = async (callback) => {
    try {
        const connection = await mongoose.connect(MONGO_URL);
        db = connection.connection.db;
        console.log("✅ Connected to MongoDB!");
        callback();
    } catch (error) {
        console.error("❌ Error connecting to MongoDB:", error);
    }
};

// const getDB = () => {
//     if (!db) throw new Error("❌ Database not connected!");
//     return db;
// };

exports.mongoConnect = mongoConnect;
// exports.getDB = getDB;