// Get the current user's account info

import { Dropbox } from "dropbox";


const getCurrentUserInfo = async (dbx: Dropbox) => {
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

const listFilesInFolder = async (dbx: Dropbox, folderPath: string) => {
	dbx
		.filesListFolder({ path: folderPath })
		.then(function (response) {
			console.log(response.result.entries[2]);
		})
		.catch(function (error) {
			console.error(error);
		});
};
