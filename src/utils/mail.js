import Mailgen from "mailgen";
import nodemailer from "nodemailer";

// returns the email content that will be used by Mailgen class to create emails then it will be sent
// by nodemailer
const emailVerficationContent = function (username, verificationLink) {
  return {
    body: {
      name: `${username}`,
      intro:
        "Welcome to Project Camp! We're very excited to have you on board.",
      action: {
        instructions: "To get started with Project Camp, please click here:",
        button: {
          color: "#22BC66", // Optional action button color
          text: "Confirm your account",
          link: `${verificationLink}`,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

const resetPasswordEmailContent = function (username, passwordResetLink) {
  return {
    body: {
      name: `${username}`,
      intro:
        "You have received this email because a password reset request for your account was received.",
      action: {
        instructions: "Click the button below to reset your password:",
        button: {
          color: "#DC4D2F",
          text: "Reset your password",
          link: `${passwordResetLink}`,
        },
      },
      outro:
        "If you did not request a password reset, no further action is required on your part.",
    },
  };
};

const sendMail = async function (options) {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Project Camp",
      link: "https://www.google.com",
    },
  });

  // email in HTML and plain text format generated ......
  const emailHTML = mailGenerator.generate(options.emailContent);
  const emailPlainText = mailGenerator.generatePlaintext(options.emailContent);

  // -----------------------------------------------------------------------------
  // Using Ethereal test SMTP service for development/testing only.
  // Emails are not delivered to real inboxes, they can be previewed at the
  // URL printed in the console (nodemailer.getTestMessageUrl(info)).
  // It is not used in production ........
  // -----------------------------------------------------------------------------
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.ETHEREAL_USER,
      pass: process.env.ETHEREAL_PASS,
    },
  });

  const message = {
    from: '"Project Camp" <maybelle.upton40@ethereal.email>',
    to: options.email,
    subject: options.subject,
    text: emailPlainText,
    html: emailHTML,
  };

  try {
    const info = await transporter.sendMail(message);
    console.log("Message sent: %s", info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (err) {
    console.log("Error occurred while sending mail ....." + err.message);
    return process.exit(1);
  }
};

export { emailVerficationContent, resetPasswordEmailContent, sendMail };

// let options = {
//     emailContent: emailVerficationContent('Devesh','https://google.com'),
//     subject: 'Verification Email'
// }

// sendMail(options)
