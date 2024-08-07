# Nest.js Prisma Rest API's Starter App

Starter App for `Nest.js`, where the `User` and `Auth` Modules are already added along with `AWS` services such as `S3` and `SES`. `Twilio`, `Sendgrid` and `Redis` integration is already in place.

## Features

- JWT Authentication
- Refresh Token
- Passport.js
- Roles Authorization
- Swagger
- Twilio
- Prisma
- Prisma Database Seeding
- Postgress
- Class Validator package for input validation
- Class-Transform
- AWS S3
- AWS SES (Simple Email Service)
- Redis
- Sendgrid


## Before you start

Make a copy of `.env.example` file as `.env` and add environment variables accordingly and also create the database.


## Getting Started

First, install the dependencies using

```bash
npm install
```

and then run the development server:

```bash
npm run start:dev
```

Open [http://localhost:3000/docs](http://localhost:3000/docs) with your browser to see the api docs.

## Running with Docker

For local development, run the database and redis services using Docker.

```bash
docker-compose up --build
```
To stop and remove containers created by docker-compose, you can use the following command:

```bash
docker-compose down
```

## Development Guidlines

- Update the User and Role Entities and then change the DTO's in `src/users/dto` accordingly.

- After updating the entities and then running the development server once, Run migration ( assuming, you have already created the table and postgress is connected to the app succuessfully )

### To run migration please type

```bash
npm run migration:generate --name=`{name of the migration}`
```

- Now update user and role seeders data `src/users/seeds/seed-data.ts` according to your entity type and then run the following command

### Data Seeding

To seed data for local development, seeders logic is located in `seeders/module-name.seeder.ts`

```bash
npm run seeds
```

### NOTE

I have added the auth and user modules as one module to avoid circular-dependency because they are interdependent.

### Create the authenticated route

You need to import user module in every other module to be able to add authentication and authorization in that module.

### Change Authorization in User Controller

As you start there are only two roles in the app, which is why you might need to change the authorization rule defined in the user controller

## Troubleshoot

- Incase you encounter a circular dependency error, then use `forwardRef` to get rid of that error, you can read more about `circular-dependency` and `forwardRef` [here](https://docs.nestjs.com/fundamentals/circular-dependency).

## Refresh Token

This project implements a refresh token mechanism, allowing users to regenerate JWT access tokens multiple times using a refresh token. The system is designed to be stateless, ensuring scalability and ease of management. This includes

- Stateless refresh token system
- Secure JWT token generation
- Error handling for invalid or tampered tokens

Enjoy Coding!