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

	// Schedule the task to run every Sunday at 00:00 (midnight)
	// cron.schedule('0 0 * * 0', () => {
	// 	console.log('Running weekly task...');
	// 	downloadXlsxAndParseToJson();
	// });
});
