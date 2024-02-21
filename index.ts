// Import fetch function for HTTP requests to the Dropbox API
import fetch from 'isomorphic-fetch';

// Import the Dropbox SDK and the Dropbox types
import { Dropbox, DropboxAuth, DropboxResponse, DropboxResponseError } from 'dropbox';

// Import the dotenv module to load environment variables from a .env file
import dotenv from 'dotenv';

// Import the file system module
import FileSystem from 'fs';

// Configure dotenv
dotenv.config();

// Define your Dropbox access token
const accessToken = process.env.DROPBOX_ACCESS_TOKEN;

// Define folder path for desired folder from Dropbox
const folderPath = process.env.DROPBOX_FOLDER_PATH ?? '';

// Create an instance of the Dropbox SDK
const dbx = new Dropbox({ accessToken, fetch: fetch });

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

const downloadFile = async (path: string) => {
	dbx
		.filesDownload({ path: path })
		.then((response) => {
			const fileData = response.result['fileBinary'];
			FileSystem.writeFileSync('maintenanceLog.xlsx', fileData, 'binary');
			console.log('File has been downloaded');
		})
		.catch((error) => {
			console.error('Error downloading file from dropbox: ', error);
		});
};
