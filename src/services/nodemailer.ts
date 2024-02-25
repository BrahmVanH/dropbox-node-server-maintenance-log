import nodeMailer from 'nodemailer';

export const sendEmail = async (text: string) => {
	const from = process.env.EMAIL_ADDRESS;
	const to = process.env.EMAIL_ADDRESS;
	const subject = 'This Weeks Tasks';
	const transporter = nodeMailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.EMAIL_ADDRESS,
			pass: process.env.EMAIL_PASSWORD,
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
		console.log('Email sent');
	} catch (error) {
		console.error('Error sending email:', error);
	}
};
