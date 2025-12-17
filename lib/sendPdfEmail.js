import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBookEmail({ email, bookTitle, pdfUrl }) {
  return resend.emails.send({
    from: "MasterWriters <info@masterwriters.org>",
    to: email,
    subject: `Your book: ${bookTitle}`,
    html: `
      <h2>Thank you for your purchase 🎉</h2>
      <p>Your book <strong>${bookTitle}</strong> is ready.</p>

      <p>
        <a href="${pdfUrl}" target="_blank">📘 Download your book</a>
      </p>

      <p><small>This link expires in 1 hour.</small></p>

      <br/>
      <p>
        Need help? Email us at 
        <strong>info@masterwriters.org</strong>
      </p>
    `,
  });
}
