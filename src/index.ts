import express from 'express';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { handleSendEmail } from './utils/helpers';

const PORT = process.env.PORT || 3000;

const app = express();

dotenv.config();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);

	handleSendEmail();

	// Schedule the task to run every Tuesday at 04:00am
	cron.schedule(
		'0 4 * * 2',
		async () => {
			await handleSendEmail();
		},
		{ timezone: 'America/New_York' }
	);
});
