// Import fetch function for HTTP requests to the Dropbox API
import fetch from 'isomorphic-fetch';

// Import the Dropbox SDK and the Dropbox types
import { Dropbox, Error, sharing, DropboxAuth, DropboxResponse, DropboxResponseError } from 'dropbox';

// Import the dotenv module to load environment variables from a .env file
import dotenv from 'dotenv';

// Import xlsx module from to parse xlsx files
import xlsx from 'node-xlsx';

// Import the file system module
import FileSystem from 'fs';

import { promisify } from 'util';

// Configure dotenv
dotenv.config();

// Define your Dropbox access token
const accessToken = process.env.DROPBOX_ACCESS_TOKEN;

// Define folder path for desired folder from Dropbox
const folderPath = process.env.DROPBOX_FOLDER_PATH ?? '';

// Define shared link for desired file from Dropbox
const sharedLink = process.env.DROPBOX_MAINTENANCE_FILE_LINK ?? '';

// Create an instance of the Dropbox SDK
const dbx = new Dropbox({ accessToken, fetch: fetch });

// Wrap writeFile in promise to use async/await
const writeFileAsync = promisify(FileSystem.writeFile);

// Get the current user's account info
const getCurrentUserInfo = async () => {
	dbx
		.usersGetCurrentAccount()
		.then(function (response) {
			console.log(response);
		})
		.catch(function (error) {
			console.error(error);
		});
};

// Make a request to the /files/list_folder endpoint and log the response - this only reads folder metadata

const listFilesInFolder = async () => {
	dbx
		.filesListFolder({ path: folderPath })
		.then(function (response) {
			console.log(response.result.entries[2]);
		})
		.catch(function (error) {
			console.error(error);
		});
};

// Download file context from Dropbox fetch

const fetchFromDropbox = async () => {
	try {
		const data = await dbx.sharingGetSharedLinkFile({ url: sharedLink });
		if (data) {
			const filePath = `dist/${data.result.name}`;
			// fileName.includes('.xlsx') ? fileName = `dist/${fileName}` : '';
			await writeFileAsync(filePath, (<any>data).result.fileBinary, { encoding: 'binary' });
			console.log(`File: ${data.result.name} saved.`);
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
		const strippedFileName = filePath.split('.')[0].split(' ');
		const formattedFileName = strippedFileName.join('');

		// Parse xlsx file and write to json file
		const workSheetsFromFile = xlsx.parse(filePath);
		// const data = workSheetsFromFile[0];

		// console.log(`File: ${formattedFileName}.json saved.`);
		const data = workSheetsFromFile[0].data;

		// Convert date values to Date objects
		const convertedData = data.map((row) => {
			return row.map((cell) => {
				// Check if the cell value is a date (numeric representation)
				if (!isNaN(cell) && Number.isInteger(cell)) {
					// Convert numeric date to Date object
					return new Date((cell - 1) * 24 * 60 * 60 * 1000); // Convert days to milliseconds
				}
				return cell;
			});
		});
		await writeFileAsync(`${formattedFileName}.json`, JSON.stringify(convertedData));
		return true;
	} catch (err) {
		console.error('Something went wrong parsing xlsx file: ', err);
		throw new Error('There was an error parsing xlsx file');
	}
};

const downloadXlsxAndParseToJson = async () => {
	try {
		let jsonWriteSuccess: boolean = false;
		const { writeSuccessful, filePath } = await fetchFromDropbox();

		if (writeSuccessful && filePath.includes('.xlsx')) {
			jsonWriteSuccess = await parseXlsxFile(filePath);
		}

		if (jsonWriteSuccess) {
			console.log('flow successful');
		} else {
			console.log('flow failed');
		}
	} catch (err) {
		console.error('Error downloading and parsing file: ', err);
		throw new Error('There was an error downloading and parsing file');
	}
};

downloadXlsxAndParseToJson();
