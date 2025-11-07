import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "FynVid",
  brokers: ["localhost:9092"],
});

export default kafka;
