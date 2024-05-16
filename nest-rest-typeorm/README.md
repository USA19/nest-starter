# Nest.js Typeorm Rest API's Starter App

Starter App for `Nest.js`, where the `User` and `Auth` Modules are already added along with `AWS` services such as `S3` and `SES`. `Twilio` and `Redis` integration is already in place.

## Features

- JWT Authentication
- Passport.js
- Swegger
- Twilio
- Typeorm
- Typeorm Database Seeding
- Postgress
- Class Validator package for input validation
- AWS ( S3 and SES )
- Redis
- Class-Transform

## Before you start

Make a copy of `.env.example` file as `.env` and add environment variables accordingly.

That's it.

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

## Development Guidlines

- Update the User and Role Entities and then change the DTO's in `src/users/dto` accordingly.

- After updating the entities and then running the development server once, Run migration ( assuming, you have already created the table and postgress is connected to the app succuessfully )

### To run migration please type

```bash
npm run typeorm:generate --name=MigrationName 
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

Enjoy Coding!
