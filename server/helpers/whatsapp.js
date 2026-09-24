/**
 * Format course enrollment message for WhatsApp (Udemy style)
 */
function buildEnrollmentMessage({ userName, courseTitle, instructorName, courseUrl }) {
  return `🎉 *Course Enrollment Confirmed!*

Hi ${userName || "Learner"}, welcome to *${courseTitle}* on Elearn Adda! 🎓

📚 *Instructor*: ${instructorName || "Elearn Adda Team"}
🔗 *Start Learning Now*: ${courseUrl}

Tip: Save this message to quick access your course progress anytime! Happy Learning! 🚀`;
}

/**
 * Format badge & certificate completion message for WhatsApp
 */
function buildCertificateMessage({ userName, courseTitle, certificateUrl, certificateId }) {
  return `🏆 *Congratulations! You've Earned a Badge & Certificate!*

Hi ${userName || "Learner"}, outstanding work completing *${courseTitle}* on Elearn Adda! 🌟

🏅 *Badge*: Master Specialist
📜 *Certificate ID*: \`${certificateId}\`
🔗 *View & Verify Certificate*: ${certificateUrl}

Showcase your new skill to your network! Keep building! 🚀`;
}

/**
 * Sends or prepares WhatsApp notification payload
 */
async function sendWhatsAppNotification({ phone, type, data }) {
  const cleanPhone = (phone || "").replace(/[^0-9+]/g, "");
  let messageText = "";

  if (type === "enrollment") {
    messageText = buildEnrollmentMessage(data);
  } else if (type === "certificate") {
    messageText = buildCertificateMessage(data);
  } else {
    messageText = data.customMessage || "Notification from Elearn Adda";
  }

  const whatsappWebUrl = `https://api.whatsapp.com/send?phone=${encodeURIComponent(
    cleanPhone
  )}&text=${encodeURIComponent(messageText)}`;

  // Optional Twilio WhatsApp integration if credentials are in env
  let twilioSent = false;
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_NUMBER) {
    try {
      const client = require("twilio")(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await client.messages.create({
        body: messageText,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${cleanPhone.startsWith("+") ? cleanPhone : "+" + cleanPhone}`,
      });
      twilioSent = true;
    } catch (err) {
      console.warn("Twilio WhatsApp notice failed (falling back to direct web link):", err.message);
    }
  }

  return {
    success: true,
    phone: cleanPhone,
    type,
    message: messageText,
    whatsappWebUrl,
    twilioSent,
  };
}

module.exports = {
  buildEnrollmentMessage,
  buildCertificateMessage,
  sendWhatsAppNotification,
};
