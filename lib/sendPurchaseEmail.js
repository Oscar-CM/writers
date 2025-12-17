import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPurchaseEmail({ email, productName }) {
  return resend.emails.send({
    from: 'MasterWriters <info@masterwriters.org>',
    to: email,
    subject: 'Your purchase is ready 🎉',
    html: `
      <h2>Thank you for your purchase!</h2>
      <p>Your <strong>${productName}</strong> is ready.</p>
      <p>You will receive your book or credentials shortly.</p>
      <br/>
      <p>Need help? Contact us at <b>info@masterwriters.org</b></p>
    `,
  });
}
