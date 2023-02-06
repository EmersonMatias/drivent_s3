
import { prisma } from "@/config";
import { getHotelById, getHotels } from "@/controllers/hotels-contreller";
import { authenticateToken } from "@/middlewares";
import { Router } from "express";

const hotelsRouter = Router()

hotelsRouter
    .all("/*", authenticateToken)
    .get("/", getHotels)
    .get("/:hotelId", getHotelById)
  
export {hotelsRouter}