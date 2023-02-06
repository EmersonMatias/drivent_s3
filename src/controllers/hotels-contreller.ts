
import { AuthenticatedRequest } from "@/middlewares";
import hotelsService from "@/services/hotels-service";
import { Request, Response } from "express";
import httpStatus from "http-status";
import { number } from "joi";

export async function getHotels(req: AuthenticatedRequest, res: Response){
    const userId = req.userId

    try{
        
        const hotels = await hotelsService.getHotels(userId)
   
        return res.status(httpStatus.OK).send(hotels);
    }catch(error){
        return res.sendStatus(httpStatus.NOT_FOUND);
    }
}

export async function getHotelById(req: AuthenticatedRequest, res: Response){
    const hotelId = req.params.hotelId
    const userId = req.userId

    console.log(hotelId)
    const Id = Number(hotelId)
    console.log(Id)
    try{
        const hotel = await hotelsService.getHotelById(userId, Id)

        return res.status(httpStatus.OK).send(hotel);
    }catch(error){
        return res.sendStatus(httpStatus.NOT_FOUND);
    }

}