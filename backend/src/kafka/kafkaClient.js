import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "FynVid",
  brokers: ["kafka:29092"],
});

export default kafka;
