import * as Sentry from '@sentry/node';
import { formatDistanceToNow } from 'date-fns';
import handleGetTasks from '../services/dropbox';
import sendEmail from '../services/nodemailer';

export interface IMaintenanceTask {
	title: string;
	description: string;
	lastCompleted: string;
	completeBy: string;
}

export const formatBasicDate = (date: string) => {
	if (!date) {
		throw new Error('No date provided');
	}
	const month = new Date(date).getMonth() + 1;
	const day = new Date(date).getDate() + 1;
	const year = new Date(date).getFullYear();
	const formattedDate = `${month}/${day}/${year}`;
	return formattedDate;
};

// xlsx date formatting function from telerik
export const getJsDateFromExcel = (excelDate: number) => {
	if (excelDate === null) {
		throw new Error('No date provided');
	}
	const secondsInDay = 24 * 60 * 60;
	const missingLeapYear = secondsInDay * 1000;
	const magicNumberOfDays = 25567 + 2;
	if (!Number(excelDate)) {
		throw new Error('wrong input format');
	}

	const delta = excelDate - magicNumberOfDays;
	const parsed = delta * missingLeapYear;
	const date = new Date(parsed);
	return date;
};

export const getTimeDifferenceFromNow = (date: string) => {
	if (!date) {
		throw new Error('No date provided');
	}
	const now = new Date();
	const taskDate = new Date(date);
	const timeDifference = taskDate.getTime() - now.getTime();
	const daysDifference = timeDifference / (1000 * 3600 * 24);
	return daysDifference;
};

export const handleFormatDistanceToNow = (date: string) => {
	if (!date) {
		throw new Error('No date provided');
	}
	const timeDifference = getTimeDifferenceFromNow(date);
	const formattedDistance = formatDistanceToNow(date);
	if (timeDifference < 0) {
		return `Overdue by ${formattedDistance}`;
	} else {
		return `Due in ${formattedDistance}`;
	}
};

const formatEmailText = (nextWeeksTasks: IMaintenanceTask[], nextMonthsTasks: IMaintenanceTask[]) => {
	let emailText = 'This week:\n\n';
	if (nextWeeksTasks.length > 0) {
		nextWeeksTasks.forEach((task) => {
			emailText += `	Title: ${task.title}\n	Description: ${task.description}\n	Last Completed: ${task.lastCompleted}\n	Complete By: ${task.completeBy}\n\n`;
		});
	}
	emailText += '\n\nNext 30 days:\n\n';
	if (nextMonthsTasks.length > 0) {
		nextMonthsTasks.forEach((task) => {
			emailText += `	Title: ${task.title}\n	Description: ${task.description}\n	Last Completed: ${task.lastCompleted}\n	Complete By: ${task.completeBy}\n\n`;
		});
	}
	return emailText;
};

export const handleSendEmail = async () => {
	try {
		const { nextWeeksTasks, nextMonthsTasks } = (await handleGetTasks()) as { nextWeeksTasks: IMaintenanceTask[]; nextMonthsTasks: IMaintenanceTask[] };
		if (nextWeeksTasks.length !== 0 && nextMonthsTasks.length !== 0) {
			const emailText = formatEmailText(nextWeeksTasks, nextMonthsTasks);
			sendEmail(emailText);
		}
	} catch (err) {
		Sentry.captureException(err);
		throw new Error('There was an error sending the email');
	}
};
