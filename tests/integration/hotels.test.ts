import app, { init } from "@/app";
import { prisma } from "@/config";
import { createEnrollmentWithAddress, createHotel, createTicket, createTicketType, createUser } from "../factories";
import httpStatus from "http-status";
import supertest from "supertest";
import { cleanDb, generateValidToken } from "../helpers";
import { TicketStatus } from "@prisma/client";
import faker from "@faker-js/faker";

beforeAll(async () => {
  await init();
  await cleanDb();
});

afterAll(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /hotels", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const response = await server.get("/hotels").set("Authorization", "Bearer XXXXXX");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("Should respond with status 404 if enrollment doesn't exist", async () => {
    const token = await generateValidToken();
    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });

  it("Should respond with status 404 if ticket doesn't exist", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    await createEnrollmentWithAddress(user);
    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });

  it("Should respond with status 404 if hotel doesn't exist", async () => {
    const token = await generateValidToken();
    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });

  it("Should respond with status 402 if ticket was not paid", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
  });

  it("Should respond with status 402 if event is remote", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await prisma.ticketType.create({
      data: {
        name: faker.name.findName(),
        price: faker.datatype.number(),
        isRemote: true,
        includesHotel: faker.datatype.boolean(),
      },
    });

    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
  });

  it("Should respond with status 402 if ticket doesn't include hotel", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await prisma.ticketType.create({
      data: {
        name: faker.name.findName(),
        price: faker.datatype.number(),
        isRemote: false,
        includesHotel: false,
      },
    });

    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
  });

  it("Should respond with status 200 when token is valid and ticket and enrollment is correct ", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await prisma.ticketType.create({
      data: {
        name: faker.name.findName(),
        price: faker.datatype.number(),
        isRemote: false,
        includesHotel: true,
      },
    });
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    await createHotel();

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          image: expect.any(String),
        }
        )]));
  });
});

describe("GET /hotels", () => {
  it("should respond with status 401 if no token is given", async () => {
    const hotel = await createHotel();

    const response = await server.get(`/hotels/${hotel.id}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const hotel = await createHotel();
    const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", "Bearer XXXXXX");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("Should respond with status 404 if enrollment doesn't exist", async () => {
    const hotel = await createHotel();
    const token = await generateValidToken();
    const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });

  it("Should respond with status 404 if ticket doesn't exist", async () => {
    const hotel = await createHotel();
    const token = await generateValidToken();
    const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });

  it("Should respond with status 404 if hotel doesn't exist", async () => {
    const hotel = await createHotel();
    const token = await generateValidToken();
    const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });

  it("Should respond with status 402 if ticket was not paid", async () => {
    const hotel = await createHotel();
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

    const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
  });

  it("Should respond with status 402 if event is remote", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await prisma.ticketType.create({
      data: {
        name: faker.name.findName(),
        price: faker.datatype.number(),
        isRemote: true,
        includesHotel: faker.datatype.boolean(),
      },
    });
    const hotel = await createHotel();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

    const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
  });

  it("Should respond with status 402 if ticket doesn't include hotel", async () => {
    const hotel = await createHotel();
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await prisma.ticketType.create({
      data: {
        name: faker.name.findName(),
        price: faker.datatype.number(),
        isRemote: false,
        includesHotel: false,
      },
    });

    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

    const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
  });

  it("Should respond with status 200 when token is valid and ticket and enrollment is correct ", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await prisma.ticketType.create({
      data: {
        name: faker.name.findName(),
        price: faker.datatype.number(),
        isRemote: false,
        includesHotel: true,
      },
    });
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();
    await prisma.room.create({
      data: {
        name: "Quarto 1",
        capacity: 4,
        hotelId: hotel.id
      }
    });

    const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toMatchObject({
      id: expect.any(Number),
      name: expect.any(String),
      image: expect.any(String),
      Rooms: expect.arrayContaining([expect.objectContaining({
        id: expect.any(Number),
        name: expect.any(String),
        capacity: expect.any(Number),
        hotelId: expect.any(Number)
      })])
    });
  });
});
