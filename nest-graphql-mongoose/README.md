# Nest.js Mongoose Graphql Starter App

Starter App for `Nest.js`, where the `User` and `Auth` Modules are already added along with `AWS` services such as `S3` and `SES`. `Twilio` and `Redis` integration is already in place.

## Features

- JWT Authentication
- Passport.js
- Roles Authorization
- Apollo Graphql
- Twilio
- Mongoose
- Database Seeding using nestjs-command package
- Mongodb
- Class Validator package for input validation
- Class-Transform
- AWS S3
- AWS SES (Simple Email Service)
- Redis

## Before you start

Make a copy of `.env.example` file as `.env` and add environment variables accordingly.


## Getting Started

First, install the dependencies using

```bash
npm install
```

and then run the development server:

```bash
npm run start:dev
```

Open [http://localhost:3000/graphql](http://localhost:3000/graphql) with your browser to see the graphql studio where all the queries and mutations can be seen.

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

- Now update user and role seeders data `src/users/seeds/seed-data.ts` according to your entity type and then run the following command 

### Data Seeding
To seed data for local development, simply type

```bash
npm run seeds
```

Seeders logic is placed is in the service of each module seprately, and all the seeders are combined in seeders module to execute them once using the script above.

### NOTE

I have added the auth and user modules as one module to avoid circular-dependency because they are interdependent.

### Create the authenticated route

You need to import user module in every other module to be able to add authentication and authorization in that module.

### Change Authorization in User Resolver
As you start there are only two roles in the app, which is why you might need to change the authorization rule defined in the user resolver

## Troubleshoot
- Incase you encounter a circular dependency error, then use `forwardRef` to get rid of that error, you can read more about `circular-dependency` and `forwardRef` [here](https://docs.nestjs.com/fundamentals/circular-dependency).

Enjoy Coding!
