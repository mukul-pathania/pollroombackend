![Logo](assets/images/PollRoom.png "Logo")

# PollRoom

![GitHub issues](https://img.shields.io/github/issues-raw/mukul-pathania/pollroom)
![GitHub pull requests](https://img.shields.io/github/issues-pr-raw/mukul-pathania/pollroom)
![Website](https://img.shields.io/website?url=https%3A%2F%2Fpollroom-six.vercel.app)
![GitHub last commit](https://img.shields.io/github/last-commit/mukul-pathania/pollroom)
![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/mukul-pathania/pollroombackend/CI/main)  


This repository contains the back-end of PollRoom.

The website is live at [https://pollroom-six.vercel.app](https://pollroom-six.vercel.app) and code, description for the **front-end** can be found at [https://github.com/mukul-pathania/pollroom](https://github.com/mukul-pathania/pollroom).


I have built a simple express server using typescript with which the website communicates. Used [Prisma](https://www.prisma.io) backed by a PostgreSQL database to model my data. 

Used passport-local and passport-google-oauth20 to authenticate users with their email or google accounts. Json web tokens(JWT) are provided on login which are used with further requests to authorize users.

[Sendgrid](https://sendgrid.com/) powers the emails used for signing up users, resetting passwords etc.

Most important functionality of this project, that is, realtime communication is made possible by [SocketIO](https://socket.io/).

This application is hosted on Heroku, which is deployed after running tests through a CI-CD pipeline using Github Actions.



## Technologies used

Just to list the tech used:

1. [Typescript](https://www.typescriptlang.org/)
2. [Express.js](https://expressjs.com/)
3. [Prisma](https://www.prisma.io/)
4. [Passport.js](http://www.passportjs.org/)
5. [Sendgrid](https://sendgrid.com/)
6. [SocketIO](https://socket.io/)
7. [Github Actions](https://github.com/features/actions)


## Development

You can clone this repository using git and install all the dependencies to start with development.

```bash
#Clone the repo first
git clone https://github.com/mukul-pathania/pollroombackend.git

#Install all the dependencies
yarn
```

Then create a file named .env with proper values for the keys defined in [app/config/index.ts](app/config/index.ts), after you have done this we can start the development server.

```bash
#Start the development server
yarn dev
```

The server should be up and running now.

You might also need to setup the fornt-end/client-side of this application for development, instructions for setting that up should be found [here](https://github.com/mukul-pathania/pollroom).  



## Testing

I have written some integration tests that tests the whole application with a real database. This setup is made possible by running the database on docker. You should have docker installed on your system and then testing the application is as simple as running:  

```bash
yarn test
```




Star this repository if you learned anything from this.