import handleGetTasks from '../services/dropbox';
import sendEmail from '../services/nodemailer';
import { IMaintenanceTask } from '../types';

// xlsx date formatting function from telerik
export const getJsDateFromExcel = (excelDate: number) => {
	const secondsInDay = 24 * 60 * 60;
	const missingLeapYear = secondsInDay * 1000;
	const magicNumberOfDays = 25567 + 2;
	if (!Number(excelDate)) {
		alert('wrong input format');
	}

	const delta = excelDate - magicNumberOfDays;
	const parsed = delta * missingLeapYear;
	const date = new Date(parsed);
	return date;
};

export const getTimeDifferenceFromNow = (date: string) => {
	const now = new Date();
	const taskDate = new Date(date);
	const timeDifference = taskDate.getTime() - now.getTime();
	const daysDifference = timeDifference / (1000 * 3600 * 24);
	return daysDifference;
};

const formatEmailText = (nextWeeksTasks: IMaintenanceTask[], nextMonthsTasks: IMaintenanceTask[]) => {
	let emailText = 'This week:\n\n';
	nextWeeksTasks.forEach((task) => {
		emailText += `	Title: ${task.title}\n	Description: ${task.description}\n	Last Completed: ${task.lastCompleted}\n	Complete By: ${task.completeBy}}\n\n`;
	});
	emailText += '\n\nNext 30 days:\n\n';
	nextMonthsTasks.forEach((task) => {
		emailText += `	Title: ${task.title}\n	Description: ${task.description}\n	Last Completed: ${task.lastCompleted}\n	Complete By: ${task.completeBy}}\n\n`;
	});
	return emailText;
};

export const handleSendEmail = async () => {
	try {
		const { nextWeeksTasks, nextMonthsTasks } = (await handleGetTasks()) as { nextWeeksTasks: IMaintenanceTask[]; nextMonthsTasks: IMaintenanceTask[] };
		if (nextWeeksTasks.length !== 0 && nextMonthsTasks.length !== 0) {
			const emailText = formatEmailText(nextWeeksTasks, nextMonthsTasks);
			console.log('Email text: ', emailText);
			sendEmail(emailText);
		}
	} catch (err) {
		console.error('Error sending email: ', err);
		throw new Error('There was an error sending the email');
	}
};
