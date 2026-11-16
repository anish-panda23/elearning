const express = require("express");
const authenticate = require("../../middleware/auth-middleware");
const router = express.Router();
const { sendWhatsAppNotification } = require("../../helpers/whatsapp");
const { answerWhatsAppQuestion } = require("../../helpers/whatsapp-ai");

router.post("/send", authenticate, async (req, res) => {
  try {
    const { phone, type, data } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }

    const result = await sendWhatsAppNotification({ phone, type, data });
    return res.json(result);
  } catch (error) {
    console.error("Error in WhatsApp notification route:", error);
    return res.status(500).json({ success: false, message: "Failed to process WhatsApp notification" });
  }
});

// Twilio calls this whenever someone messages the WhatsApp number. It has no JWT, so we
// authenticate it with Twilio's request signature instead. Twilio sends form-encoded bodies.
router.post("/webhook", express.urlencoded({ extended: false }), async (req, res) => {
  const twiml = (text) => {
    const MessagingResponse = require("twilio").twiml.MessagingResponse;
    const r = new MessagingResponse();
    if (text) r.message(text);
    return res.type("text/xml").send(r.toString());
  };

  try {
    if (process.env.NODE_ENV !== "test") {
      const url =
        process.env.TWILIO_WEBHOOK_URL ||
        `${req.headers["x-forwarded-proto"] || req.protocol}://${req.get("host")}${req.originalUrl}`;
      const valid = require("twilio").validateRequest(
        process.env.TWILIO_AUTH_TOKEN || "",
        req.get("X-Twilio-Signature") || "",
        url,
        req.body
      );
      if (!valid) return res.status(403).send("Invalid signature");
    }

    const from = (req.body.From || "").replace("whatsapp:", "");
    const question = (req.body.Body || "").trim();
    if (!from || !question) return twiml("Send me a question and I'll answer it! 🎓");

    return twiml(await answerWhatsAppQuestion(from, question));
  } catch (error) {
    console.error("WhatsApp AI webhook error:", error.message);
    return twiml("Sorry, I'm having trouble answering right now. Please try again in a moment.");
  }
});

module.exports = router;
