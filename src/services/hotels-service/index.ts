import { notFoundError } from "@/errors";
import enrollmentRepository from "@/repositories/enrollment-repository";
import hotelRepository from "@/repositories/hotel-repository"
import ticketRepository from "@/repositories/ticket-repository";


async function getHotels(userId: number){
    const enrollmentExist = await enrollmentRepository.findWithAddressByUserId(userId)
    if(!enrollmentExist) throw notFoundError()

    const ticketExist = await ticketRepository.findTicketByEnrollmentId(enrollmentExist.id)
    if(!ticketExist) throw notFoundError()

    if(ticketExist.status === "RESERVED" || ticketExist.TicketType.isRemote === true ||  ticketExist.TicketType.includesHotel === false ) throw "Payment Required"

    const hotels = await hotelRepository.findHotels()
    if (!hotels) throw notFoundError();

    return hotels
}

async function getHotelById(userId: number,hotelId: number){
    const enrollmentExist = await enrollmentRepository.findWithAddressByUserId(userId)
    if(!enrollmentExist) throw notFoundError()

    const ticketExist = await ticketRepository.findTicketByEnrollmentId(enrollmentExist.id)
    if(!ticketExist) throw notFoundError()

    if(ticketExist.status === "RESERVED" || ticketExist.TicketType.isRemote === true ||  ticketExist.TicketType.includesHotel === false ) throw "Payment Required"

    const hotel = await hotelRepository.findHotelById(hotelId)    
    if (!hotel) throw notFoundError();

    return hotel
}


const hotelsService = {
    getHotels,
    getHotelById

}

export default hotelsService