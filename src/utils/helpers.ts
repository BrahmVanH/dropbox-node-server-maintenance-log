import { promisify } from 'util';
import { readFile } from 'fs';

import maintenanceLog from '../../dist/maintenanceLog.json';

const readFileAsync = promisify(readFile);

export interface IMaintenanceTask {
	title: string;
	description: string;
	date: string;
}

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

const getMaintenanceTasks = () => {
	if (!Array.isArray(maintenanceLog)) {
		throw new Error('Maintenance tasks data is not an array.');
	}
	const maintenanceTasks: IMaintenanceTask[] = maintenanceLog
		.filter((task) => task[3] !== null && task[4] !== null && task[10] !== null && task[0] !== ('Cadence' || 'Daily') && task[5] === 'Brahm')
		.map((task) => ({
			title: task[3],
			description: task[4],
			date: task[10],
		})) as IMaintenanceTask[];

	console.log(maintenanceTasks);
	return maintenanceTasks;
};

getMaintenanceTasks();

const getTimeDifferenceFromNow = (date: string) => {
	const now = new Date();
	const taskDate = new Date(date);
	const timeDifference = taskDate.getTime() - now.getTime();
	const daysDifference = timeDifference / (1000 * 3600 * 24);
	return daysDifference;
};

export const getThisWeeksTasks = () => {
	const maintenanceTasks = getMaintenanceTasks();
	console.log('maintenance tasks from getThisWeeksTasks', maintenanceTasks);
	const thisWeeksTasks = maintenanceTasks.filter((task) => {
		const daysDifference = getTimeDifferenceFromNow(task.date);
		return daysDifference < 7;
	});

	return thisWeeksTasks;
};
