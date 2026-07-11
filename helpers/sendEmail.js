const { BrevoClient } = require("@getbrevo/brevo");

const { BREVO_API_KEY, EMAIL_FROM } = process.env;

if (!BREVO_API_KEY) {
  throw new Error("Missing BREVO_API_KEY in environment");
}

if (!EMAIL_FROM) {
  throw new Error("Missing EMAIL_FROM in environment");
}

const brevo = new BrevoClient({
  apiKey: BREVO_API_KEY,
});

const sendEmail = async ({ to, subject, html }) => {
  if (!to || !subject || !html) {
    throw new Error("Missing required email fields");
  }

  return brevo.transactionalEmails.sendTransacEmail({
    sender: {
      name: "Contacts Manager",
      email: EMAIL_FROM,
    },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  });
};

module.exports = sendEmail;
