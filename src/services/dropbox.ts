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

import { promisify } from 'util';
import { IMaintenanceTask, getJsDateFromExcel, getThisWeeksTasks } from '../utils/helpers';

// Configure dotenv
configDotenv();

const appSecret = process.env.DROPBOX_APP_SECRET ?? '';
const redirectUri = process.env.DROPBOX_REDIRECT_URI ?? '';
const authorizationCode = process.env.DROPBOX_AUTHORIZATION_CODE ?? '';
const refreshToken = process.env.DROPBOX_REFRESH_TOKEN ?? '';

// Define folder path for desired folder from Dropbox
const folderPath = process.env.DROPBOX_FOLDER_PATH ?? '';

// Define shared link for desired file from Dropbox
const sharedLink = process.env.DROPBOX_MAINTENANCE_FILE_LINK ?? '';

// Create an instance of the Dropbox SDK
// const dbx = new Dropbox({accessToken, fetch: fetch });

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
			return { writeSuccessful: true, filePath };
		}
	} catch (err) {
		console.error('Error fetching file from Dropbox: ', err);
		throw new Error('There was an error fetching file from Dropbox');
	}
	return { writeSuccessful: false, filePath: '' };
};

const parseXlsxFile = async (filePath: string) => {
	try {
		// Remove .xlsx extension and any spaces from file name
		const strippedFileName = filePath.split('.')[0];

		// Parse xlsx file and write to json file
		const workSheetsFromFile = xlsx.parse(filePath);

		const data = workSheetsFromFile[0].data;

		// Convert date values to Date objects
		const convertedData = data.map((row) => {
			return row.map((cell) => {
				// Check if the cell value is a date (numeric representation)
				if (!isNaN(cell) && Number.isInteger(cell)) {
					// Convert numeric date to Date object
					return getJsDateFromExcel(cell); // Convert days to milliseconds
				}
				return cell;
			});
		});
		await writeFileAsync(`${strippedFileName}.json`, JSON.stringify(convertedData));
		return true;
	} catch (err) {
		console.error('Something went wrong parsing xlsx file: ', err);
		throw new Error('There was an error parsing xlsx file');
	}
};

export const downloadXlsxAndParseToJson = async () => {
	try {
		let jsonWriteSuccess: boolean = false;
		const { writeSuccessful, filePath } = await fetchFromDropbox();

		if (writeSuccessful && filePath.includes('.xlsx')) {
			jsonWriteSuccess = await parseXlsxFile(filePath);
		}

		if (jsonWriteSuccess) {
			console.log('flow successful');
			return true;
		} else {
			console.log('flow failed');
			return false;
		}
	} catch (err) {
		console.error('Error downloading and parsing file: ', err);
		throw new Error('There was an error downloading and parsing file');
	}
};

export const handleGetThisWeeksTasks = async () => {
	try {
		let thisWeeksTasks: IMaintenanceTask[] = [];
		const success = await downloadXlsxAndParseToJson();

		if (success) {
			thisWeeksTasks = getThisWeeksTasks();
		}
		if (thisWeeksTasks.length !== 0) {
			console.log('This weeks tasks: ', thisWeeksTasks);
			// return thisWeeksTasks;
		}
	} catch (err) {
		console.error("Error getting this week's tasks: ", err);
		throw new Error("There was an error getting this week's tasks");
	}
};
