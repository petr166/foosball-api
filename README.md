# foosball-api - GraphQL API for [Foosball App](https://github.com/petr166/foosball-app#readme)

> NodeJS backend serving data from MongoDB through a GraphQL layer, k!boom  
> ^for feature set and more check the [app repo](https://github.com/petr166/foosball-app#readme)

## Prerequisites

- NodeJS with npm
- MongoDB instance (either local or remote)

## Run server

- create a `.env` file using the format from `.env.example`, with your options
  - especially important, set the db credentials
- run `npm run dev`
- access the api at http://localhost:4000 by default

## Technologies

> these are the main technologies and/or modules used, for all libraries check [package.json](package.json)

- [NodeJS](https://nodejs.org/) - JavaScript backend/server-side solution of choice

  - [Typescript](https://www.typescriptlang.org) - superset of Javascript, adding types and more

- [MongoDB](https://www.mongodb.com/) - data storage solution that just speaks JSON and pairs very well with Node

  - [Mongoose](http://mongoosejs.com/) - package that helps with object modeling and manages connection between server and database

  - [Bcrypt](https://github.com/kelektiv/node.bcrypt.js) - for hashing user passwords to be stored in the database

- [GraphQL](https://graphql.org) - api query language, for efficient app-server data exchange

  - [Apollo Server](https://github.com/apollographql/apollo-server) - full graphQL server implementation, to handle queries, mutations, resolvers etc.

  - [JSON Web Token](https://github.com/auth0/node-jsonwebtoken) - generate [JWTs](https://jwt.io) for secure authentication
