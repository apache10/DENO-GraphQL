import { Application } from "https://deno.land/x/oak/mod.ts";
import { applyGraphQL, gql } from "https://deno.land/x/oak_graphql/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import db from './mongodb.ts';

// collections 
const Movie = db.collection("movies");
const Director = db.collection("directors");


const app = new Application();

app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.headers.get("X-Response-Time");
  console.log(`${ctx.request.method} ${ctx.request.url} - ${rt}`);
});

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.response.headers.set("X-Response-Time", `${ms}ms`);
});

const types = gql`
  type Movie {
    id: ID
    name: String
    genre: String
    directorId: ID
  }
  type Director{
    id: ID
    name: String
    age: Int
  }
  input DirectorInput {
    name: String
    age: Int
  }

  input MovieInput {
    name: String
    image: String
  }
  type ResolveType {
    done: Boolean
  }
  type Query {
    getMovie(id: ID): Movie
    getMovies: [Movie!]!
    getDirector(id:ID): Director
    getDirectors: [Director!]!
  }
  type Mutation {
    addDirector(name: String!, age: Int!): ResolveType!
    addMovie(name: String!, genre: String!, directorId: String!): ResolveType!
  }
`;



  const resolvers = {
    Query: {
      getMovie: async (parent: any, { id } : any) => {
        
        const movie = await Movie.findOne({ _id: { $oid: id } });;//dinos.find((dino) => dino.name.includes(name));
        if (!movie) {
          throw new Error(`No movie found `);
        }
        return movie;
      },
      getMovies: async () => {
          const movieList = await Movie.find({});
        return movieList;
      },
      getDirector: async (parent: any,{id}: any) => {
          
          return await Director.findOne({ _id: { $oid: id } });
      },
      getDirectors: async () => {
        return await Director.find({});
      }
    },
    Mutation: {
      addDirector: async (parent: any, {name,age}: any) => {
        const director: any = {
          name:name,
          age:age,
      };
      // db query to inset return id as json
      const id = await Director.insertOne(director);
        console.log(id);
        return {
          done: true,
        };
      },
      addMovie: async (parent: any, {name,genre, directorId}: any) => {
        const movie: any = {
          name:name,
          genre:genre,
          directorId:directorId
      };
      const id = await Movie.insertOne(movie);
        console.log(id);
        return {
          done: true,
        };
      },
    },
  }



const GraphQLService = await applyGraphQL({
  typeDefs: types,
  resolvers: resolvers
})
app.use(
    oakCors({
      origin: /^.+localhost:(1234|3000)$/,
      optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    }),
  );

app.use(GraphQLService.routes(), GraphQLService.allowedMethods());

console.log("Server start at http://localhost:4000");
await app.listen({ port: 4000 });