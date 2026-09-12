import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});


// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};


async function sendRegistrationEmail(userEmail , name) {
  const subject = 'Welcome to backend ledger !';
  const text = `Hello ${name},/n/nThank you for registering at Backend Ledger`
  const html = `<p>Hello ${name},</p> <p> Thank you for registering in Backend ledger</p>`
  await sendEmail(userEmail, subject , text , html)
}

async function sendTransactionEmail(userEmail , name , amount , toAccount){
  const subject = `Transaction Successful`;
    const text = `Hello ${name},/n/nYour transaction of ${amount} to account ${toAccount} is successful`
    const html = `<p>Hello ${name},</p><p>Your transaction of ${amount} to account ${toAccount} is successful</p>`
    await sendEmail(userEmail , subject , text , html)
}

async function sendTransactionFailureEmail(userEmail , name , amount , toAccount){
  const subject = `Transaction Failed`;
    const text = `Hello ${name},/n/nYour transaction of ${amount} to account ${toAccount} is Failed`
    const html = `<p>Hello ${name},</p><p>Your transaction of ${amount} to account ${toAccount} is Failed</p>`
    await sendEmail(userEmail , subject , text , html)
}


export {sendRegistrationEmail , sendTransactionEmail , sendTransactionFailureEmail};