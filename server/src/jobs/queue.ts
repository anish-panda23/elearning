import { Queue, Worker } from "bullmq";
import { redis } from "../config/redis";

const connection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
};

export const certQueue = new Queue("certificate-generation", { connection });
export const emailQueue = new Queue("email-notifications", { connection });

// Certificate Worker
export const certWorker = new Worker(
  "certificate-generation",
  async (job) => {
    const { userId, courseId } = job.data;
    console.log(`Processing certificate generation for user ${userId} on course ${courseId}...`);
    // Simulate PDF processing I/O delay
    await new Promise((res) => setTimeout(res, 1500));
    console.log(`Certificate generated successfully for user ${userId}!`);
    return { certUrl: `https://cdn.elearning.com/certs/${userId}_${courseId}.pdf` };
  },
  { connection }
);

// Email Receipt Worker
export const emailWorker = new Worker(
  "email-notifications",
  async (job) => {
    const { email, orderId, amount } = job.data;
    console.log(`Sending purchase receipt email to ${email} for order ${orderId} (\$${amount})...`);
    // Simulate email SMTP processing I/O delay
    await new Promise((res) => setTimeout(res, 1000));
    console.log(`Receipt email sent to ${email}`);
    return { delivered: true };
  },
  { connection }
);
