import express from 'express';
import path from 'path';
import { configDotenv } from 'dotenv';
import { downloadXlsxAndParseToJson, handleGetThisWeeksTasks } from './services/dropbox';
import cron from 'node-cron';
import { getThisWeeksTasks } from './utils/helpers';

const PORT = process.env.PORT || 3000;

const app = express();

configDotenv();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
	handleGetThisWeeksTasks();

	// Schedule the task to run every Sunday at 00:00 (midnight)
	// cron.schedule('0 0 * * 0', () => {
	// 	console.log('Running weekly task...');
	// 	downloadXlsxAndParseToJson();
	// });
});
