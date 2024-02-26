// Import express to set up a server
import express from 'express';

// Import fetch function for HTTP requests to the Dropbox API
import fetch from 'isomorphic-fetch';

// Import the Dropbox SDK and the Dropbox types
import { Dropbox, Error, sharing, DropboxAuth, DropboxResponse, DropboxResponseError } from 'dropbox';

// Import the dotenv module to load environment variables from a .env file
import { configDotenv } from 'dotenv';

// Import xlsx module from to parse xlsx files
import xlsx from 'node-xlsx';

// Import the file system module
import FileSystem from 'fs';

import { formatDistanceToNow } from 'date-fns';

import { promisify } from 'util';
import { IMaintenanceTask, formatBasicDate, getJsDateFromExcel, getTimeDifferenceFromNow, handleFormatDistanceToNow } from '../utils/helpers';
// import maintenanceLog from '../../dist/maintenanceLog.json';

// Configure dotenv
// configDotenv();

// Define shared link for desired file from Dropbox

// Wrap writeFile in promise to use async/await
const writeFileAsync = promisify(FileSystem.writeFile);

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
		console.error('Error refreshing access token:', error);
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
			const fileName = data.result.name.split(' ').join('');
			const filePath = `dist/${fileName}`;
			await writeFileAsync(filePath, (<any>data).result.fileBinary, { encoding: 'binary' });
			console.log(`File: ${fileName} saved.`);
			return { writeSuccessful: true, filePath, data: (<any>data).result.fileBinary };
		}
	} catch (err) {
		console.error('Error fetching file from Dropbox: ', err);
		throw new Error('There was an error fetching file from Dropbox');
	}
	return { writeSuccessful: false, filePath: '', data: null };
};

// Parse xlsx file to json

const parseXlsxFile = async (filePath: string, xlsxData: any) => {
	try {
		// Remove .xlsx extension and any spaces from file name
		const strippedFileName = filePath.split('.')[0];

		// Parse xlsx file and write to json file
		const workSheetsFromFile = xlsx.parse(xlsxData);

		const data = workSheetsFromFile[0].data;

		// Convert date values to Date objects
		const convertedData = data.map((row) => {
			return row.map((cell) => {
				// Check if the cell value is a date (numeric representation)
				if (!isNaN(cell) && cell !== 0 && Number.isInteger(cell)) {
					// Convert numeric date to Date object
					return getJsDateFromExcel(cell); // Convert days to milliseconds
				}
				return cell;
			});
		});
		// await writeFileAsync(`${strippedFileName}.json`, JSON.stringify(convertedData));
		return data;
	} catch (err) {
		console.error('Something went wrong parsing xlsx file: ', err);
		throw new Error('There was an error parsing xlsx file');
	}
};

export const xlsxToJsonFlow = async () => {
	try {
		// let jsonWriteSuccess: boolean = false;
		const { writeSuccessful, filePath, data } = await fetchFromDropbox();

		if (writeSuccessful && filePath.includes('.xlsx') && data) {
			const parsedJson = await parseXlsxFile(filePath, data);
			return parsedJson;
		} else {
			console.log('File not parsed, possibly no data or not an xlsx file.');
			return false;
		}

		// if (jsonWriteSuccess) {
		// 	console.log('flow successful');
		// 	return true;
		// } else {
		// 	console.log('flow failed');
		// 	return false;
		// }
	} catch (err) {
		console.error('Error downloading and parsing file: ', err);
		throw new Error('There was an error downloading and parsing file');
	}
};

const getMaintenanceTasks = (convertedData: any[]) => {
	// maintenanceLog = await import('../../dist/maintenanceLog.json');
	if (!Array.isArray(convertedData)) {
		throw new Error('Maintenance tasks data is not an array.');
	}
	const maintenanceTasks: IMaintenanceTask[] = convertedData
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
	const maintenanceTasks: IMaintenanceTask[] = getMaintenanceTasks(convertedData) as IMaintenanceTask[];
	if (maintenanceTasks.length !== 0) {
		const tasks = maintenanceTasks.filter((task) => {
			const daysDifference = getTimeDifferenceFromNow(task.completeBy);
			return daysDifference < 7;
		});
		const thisWeeksTasks = tasks.map((task) => {
			console.log('task in thisWeeksTasks: ', task);
			return {
				...task,
				lastCompleted: formatBasicDate(task.lastCompleted),
				completeBy: `${formatBasicDate(task.completeBy)} - ${handleFormatDistanceToNow(task.completeBy)}`,
			};
		});
		console.log('this weeks tasks: ', thisWeeksTasks);
		return thisWeeksTasks;
	}
};

const getNextMonthsTasks = async (convertedData: any) => {
	try {
		const maintenanceTasks = await getMaintenanceTasks(convertedData);
		if (maintenanceTasks.length !== 0) {
			const tasks = maintenanceTasks.filter((task) => {
				const daysDifference = getTimeDifferenceFromNow(task.completeBy);
				console.log('daysDifference: ', daysDifference);
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
		console.error("Error getting this month's tasks: ", err);
		throw new Error("There was an error getting this month's tasks");
	}
};

const handleGetTasks = async () => {
	try {
		let nextWeeksTasks: IMaintenanceTask[] | undefined = [];
		let nextMonthsTasks: IMaintenanceTask[] | undefined = [];
		const convertedData = await xlsxToJsonFlow();

		if (convertedData) {
			nextWeeksTasks = await getNextWeeksTasks(convertedData);
			nextMonthsTasks = await getNextMonthsTasks(convertedData);
		} else {
			console.log('No converted data');
		}
		if (nextMonthsTasks && nextWeeksTasks && nextWeeksTasks.length !== 0 && nextMonthsTasks.length !== 0) {
			console.log('This weeks tasks: ', nextWeeksTasks);
			console.log('This weeks tasks: ', nextMonthsTasks);
			return { nextWeeksTasks, nextMonthsTasks };
		}
	} catch (err) {
		console.error("Error getting this week's tasks: ", err);
		throw new Error("There was an error getting this week's tasks");
	}
};

export default handleGetTasks;
