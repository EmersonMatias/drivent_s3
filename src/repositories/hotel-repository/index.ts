import { prisma } from "@/config";


async function findHotels(){
    return prisma.hotel.findMany()
}

async function findHotelById(hotelId: number){
    console.log(hotelId)
    return prisma.hotel.findUnique({
        where: {
            id: hotelId
        },
        include:{
            Rooms: true
        }
        
    })
}

const hotelRepository = {
    findHotels,
    findHotelById
}

export default hotelRepository