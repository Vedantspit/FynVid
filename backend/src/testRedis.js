import { createClient } from "redis";

const client = await createClient().connect();

// await client.del("mylist"); // clear list

await client.lPush("mylist", "A"); // LEFT:  A
await client.rPush("mylist", "B"); // RIGHT: A B
await client.lPush("mylist", "C"); // LEFT:  C A B
await client.rPush("mylist", "D"); // RIGHT: C A B D

const list = await client.lRange("mylist", 0, -1);
console.log("Final list:", list);

client.destroy();
