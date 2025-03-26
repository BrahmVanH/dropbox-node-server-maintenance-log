import * as Sentry from '@sentry/node';
import nodeMailer from 'nodemailer';

const sendEmail = async (text: string) => {
	const from = process.env.EMAIL_ADDRESS;
	const to = process.env.EMAIL_ADDRESS;
	const subject = 'This Weeks Tasks';
	const transporter = nodeMailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.EMAIL_ADDRESS,
			pass: process.env.EMAIL_PASSWORD,
		},
		tls: {
			rejectUnauthorized: false, // Allow self-signed certificates
		},
	});

	const mailOptions = {
		from,
		to,
		subject,
		text,
	};

	try {
		await transporter.sendMail(mailOptions);
	} catch (error) {
		Sentry.captureException(error);
	}
};

export default sendEmail;
