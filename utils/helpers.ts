import { promisify } from 'util';
import { readFile } from 'fs';

import maintenanceLog from '../dist/maintenanceLog.json';

const readFileAsync = promisify(readFile);

interface IMaintenanceTask {
	title: string | null;
	description: string | null;
	date: string | null;
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

export const printJsonFile = async () => {
	try {
		const maintenanceTasks: IMaintenanceTask[] = maintenanceLog.map((task) => ({
			title: task[3],
			description: task[4],
			date: task[10],
		}));

		console.log(maintenanceTasks);
	} catch (err) {
		console.error('Error reading json file: ', err);
		throw new Error('There was an error reading json file');
	}
};
