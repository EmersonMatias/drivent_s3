import { prisma } from "@/config";

export async function createHotel() {
  return await prisma.hotel.create({
    data: {
      "name": "Caribe Hotel",
      "image": "https://www.melhoresdestinos.com.br/wp-content/uploads/2019/10/bonaire-caribe-capa.jpg"
    }
  });
}
