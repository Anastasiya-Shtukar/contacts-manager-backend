const nodemailer = require("nodemailer");

const { EMAIL_USER, EMAIL_PASSWORD } = process.env;

if (!EMAIL_USER || !EMAIL_PASSWORD) {
  throw new Error("Missing EMAIL_USER or EMAIL_PASSWORD in environment");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  return transporter.sendMail({
    from: EMAIL_USER,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
