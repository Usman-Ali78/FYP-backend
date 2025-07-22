const express = require("express")
const activityRouter = express.Router()
const activityController = require("../controller/activityController")
const authMiddleware = require("../middleware/authMiddleware")

activityRouter.get("/me", authMiddleware, activityController.getUserActivity)

module.exports = activityRouter