import request from "supertest";
import { app } from "../src/server";

describe("E-Learning API Core Integration Tests", () => {
  it("GET /health - should return 200 OK with server health metrics", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("OK");
    expect(res.body.services).toBeDefined();
  });

  it("GET /ai/smart-search - should parse natural language intent filters", async () => {
    const res = await request(app).get("/ai/smart-search?query=beginner+course+on+async+JS+under+$20");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.parsedIntent.maxPrice).toBe(20);
    expect(res.body.parsedIntent.level).toBe("beginner");
  });

  it("POST /ai/generate-quiz - should generate or serve cached quiz", async () => {
    const res = await request(app)
      .post("/ai/generate-quiz")
      .send({ lectureId: "lec-test-101" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.quiz)).toBe(true);
  });
});
