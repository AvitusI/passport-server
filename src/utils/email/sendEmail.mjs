import nodemailer from "nodemailer";
import handlebars from "handlebars";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export const sendEmail = async (email, subject, payload, template) => {
  try {
    console.log(process.env.EMAIL_USERNAME);
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      port: 465,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const source = fs.readFileSync(
      path.join(__dirname, "template", template),
      "utf-8"
    );

    const compiledTemplate = handlebars.compile(source);

    const options = () => {
      return {
        from: process.env.FROM_EMAIL,
        to: email,
        subject: subject,
        html: compiledTemplate(payload),
      };
    };

    transporter.sendMail(options(), (error, info) => {
      if (error) {
        return error.message;
      } else {
        return res.status(200).json({ success: true });
      }
    });

    console.log("mail sent successfully");
  } catch (error) {
    console.error(error);
  }
};
