const express = require("express")
const ngoRouter = express.Router()
const ngoController = require("../controller/ngoController")
const authMiddleware = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")

ngoRouter.get("/ngo",authMiddleware,roleMiddleware(["ngo"]) ,ngoController.postNgo)

exports.ngoRouter = ngoRouter