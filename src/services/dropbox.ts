import * as Sentry from '@sentry/node';

// Import fetch function for HTTP requests to the Dropbox API
import fetch from 'isomorphic-fetch';

// Import the Dropbox SDK and the Dropbox types
import { Dropbox } from 'dropbox';

// Import xlsx module from to parse xlsx files
import xlsx from 'node-xlsx';

// Import helper functions
import { formatBasicDate, getJsDateFromExcel, getTimeDifferenceFromNow, handleFormatDistanceToNow } from '../utils/helpers';

// Import IMaintenanceTask type
import { IMaintenanceTask } from '../types';

// Refresh access token
const refreshAccessToken = async (refreshToken: string, appKey: string, appSecret: string) => {
	try {
		const response = await fetch('https://api.dropbox.com/oauth2/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({
				grant_type: 'refresh_token',
				refresh_token: refreshToken,
				client_id: appKey,
				client_secret: appSecret,
			}),
		});

		if (!response.ok) {
			throw new Error('Error refreshing access token');
		}

		const data = await response.json();

		if (!data.access_token) {
			throw new Error('Error refreshing access token');
		}

		return data.access_token;
	} catch (error) {
		Sentry.captureException(error);
	}
};

// Download file context from Dropbox fetch

const fetchFromDropbox = async () => {
	// Grab environment variables
	const refreshToken = process.env.DROPBOX_REFRESH_TOKEN ?? '';
	const appKey = process.env.DROPBOX_APP_KEY ?? '';
	const appSecret = process.env.DROPBOX_APP_SECRET ?? '';
	const sharedLink = process.env.DROPBOX_MAINTENANCE_FILE_LINK ?? '';

	// Refresh access token
	const accessToken = await refreshAccessToken(refreshToken, appKey, appSecret);

	// Create an instance of the Dropbox SDK
	const dbx = new Dropbox({ accessToken, fetch: fetch });

	// Fetch file from Dropbox
	try {
		const data = await dbx.sharingGetSharedLinkFile({ url: sharedLink });
		if (data) {
			return { data: (<any>data).result.fileBinary };
		}
	} catch (err) {
		Sentry.captureException(err);
		throw new Error('There was an error fetching file from Dropbox');
	}
	return { data: null };
};

// Parse xlsx file to json

const parseXlsxFile = async (xlsxData: any) => {
	try {
		// Parse xlsx file and write to json file
		const workSheetsFromFile = xlsx.parse(xlsxData);

		const data = workSheetsFromFile[0].data;

		return data;
	} catch (err) {
		Sentry.captureException(err);
		throw new Error('There was an error parsing xlsx file');
	}
};

export const xlsxToJsonFlow = async () => {
	try {
		// let jsonWriteSuccess: boolean = false;
		const { data } = await fetchFromDropbox();

		if (data) {
			const parsedJson = await parseXlsxFile(data);
			return parsedJson;
		} else {
			console.log('File not parsed, possibly no data or not an xlsx file.');
			return false;
		}
	} catch (err) {
		Sentry.captureException(err);
		throw new Error('There was an error downloading and parsing file');
	}
};

const getMaintenanceTasks = (maintenanceJson: any[]) => {
	if (!Array.isArray(maintenanceJson)) {
		throw new Error('Maintenance tasks data is not an array.');
	}
	const maintenanceTasks: IMaintenanceTask[] = maintenanceJson
		.filter((task) => task[9] !== null && task[10] !== null && task[16] !== null && task[0] !== 'Cadence' && task[0] !== 'Daily' && task[11] === 'Brahm' && task[14] !== null)
		.map((task) => ({
			title: task[9],
			description: task[10],
			lastCompleted: task[14] ? `${getJsDateFromExcel(task[14])}` : 'N/A',
			completeBy: task[16] ? `${getJsDateFromExcel(task[16])}` : 'N/A',
		}));

	return maintenanceTasks;
};

const getNextWeeksTasks = (convertedData: any[]) => {
	if (!convertedData) {
		throw new Error('No data provided');
	}
	const maintenanceTasks: IMaintenanceTask[] = getMaintenanceTasks(convertedData);
	if (maintenanceTasks.length !== 0) {
		const tasks = maintenanceTasks.filter((task) => {
			const daysDifference = getTimeDifferenceFromNow(task.completeBy);
			return daysDifference < 7;
		});
		const thisWeeksTasks = tasks.map((task) => {
			return {
				...task,
				lastCompleted: formatBasicDate(task.lastCompleted),
				completeBy: `${formatBasicDate(task.completeBy)} - ${handleFormatDistanceToNow(task.completeBy)}`,
			};
		});
		return thisWeeksTasks;
	}
};

const getNextMonthsTasks = async (convertedData: any) => {
	try {
		const maintenanceTasks = await getMaintenanceTasks(convertedData);
		if (maintenanceTasks.length !== 0) {
			const tasks = maintenanceTasks.filter((task) => {
				const daysDifference = getTimeDifferenceFromNow(task.completeBy);
				return daysDifference < 30;
			});
			const thisMonthsTasks = tasks.map((task) => {
				return {
					...task,
					lastCompleted: formatBasicDate(task.lastCompleted),
					completeBy: `${formatBasicDate(task.completeBy)} - ${handleFormatDistanceToNow(task.completeBy)}`,
				};
			});
			return thisMonthsTasks;
		}
	} catch (err) {
		Sentry.captureException(err);
		throw new Error("There was an error getting this month's tasks");
	}
};

const handleGetTasks = async () => {
	try {
		let nextWeeksTasks: IMaintenanceTask[] | undefined = [];
		let nextMonthsTasks: IMaintenanceTask[] | undefined = [];
		const maintenanceJson = await xlsxToJsonFlow();

		if (maintenanceJson) {
			nextWeeksTasks = await getNextWeeksTasks(maintenanceJson);
			nextMonthsTasks = await getNextMonthsTasks(maintenanceJson);
		}
		if (nextMonthsTasks && nextWeeksTasks && nextWeeksTasks.length !== 0 && nextMonthsTasks.length !== 0) {
			return { nextWeeksTasks, nextMonthsTasks };
		}
	} catch (err) {
		Sentry.captureException(err);
		throw new Error("There was an error getting this week's tasks");
	}
};

export default handleGetTasks;
