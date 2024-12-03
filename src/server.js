import express from "express";
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from "@apollo/server/express4";
import { prismaClient } from "./lib/db.js";

const init = async () => {
    const app = express();
    const PORT = 8000;

    app.use(express.json());

    // Create a GraphQl Server
    const gqlServer = new ApolloServer({
        typeDefs: `
            type Query{
                hello : String
                say(name : String) : String
            }
            type Mutation{
                createUser(firstName : String!,lastName : String!,email : String!, password: String!): Boolean
            }
        `, // Schema as a String

        resolvers: {
            Query : {
                hello : () => `Hey there i am a graphql Server`,
                say : ( _ ,{name}) =>  `Hey ${name}, How are You?`
            },
            Mutation : {
                createUser: async (_, { firstName, lastName, email, password }) => {
                    await prismaClient.user.create({
                        data : {
                            email,
                            firstName,
                            lastName,
                            password,
                            salt : "randomSalt"
                        }
                    });
                    return true;
                } 
            }
        }, //actuall function that will exexute
    });

    // start the gql Server
    await gqlServer.start();

    app.get("/", (req, res) => {
        res.json({ message: "Server is up and running" });
    })

    
    app.use("/graphql", expressMiddleware(gqlServer));
    
    app.listen(PORT, () => console.log(`App listening on PORT http://localhost:${PORT}`))
}


await init();