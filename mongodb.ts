import { MongoClient } from "https://deno.land/x/mongo@v0.7.0/mod.ts";

const client = new MongoClient();
client.connectWithUri("mongodb+srv://DENO:PasswordDeno@cluster0-pv4s6.mongodb.net/test?retryWrites=true&w=majority");

const db = client.database('test');

export default db;