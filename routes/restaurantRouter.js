const express = require("express")
const restaurantRouter = express.Router()
const restaurantController = require("../controller/restaurantController")
const authMiddleware = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")

restaurantRouter.get("/Restaurant",authMiddleware ,roleMiddleware(["restaurant"]),restaurantController.getRestaurant)

exports.restaurantRouter = restaurantRouter