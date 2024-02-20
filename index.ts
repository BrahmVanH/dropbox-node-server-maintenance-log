import fetch from 'isomorphic-fetch';
import { Dropbox, DropboxAuth, DropboxResponse, DropboxResponseError } from 'dropbox';
import dotenv from 'dotenv';

dotenv.config();

const dbx = new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN, fetch: fetch });
// dbx
// 	.filesListFolder({ path: '' })
// 	.then(function (response) {
// 		console.log(response);
// 	})
// 	.catch(function (error) {
// 		console.log(error);
// 	});
dbx
	.usersGetCurrentAccount()
	.then(function (response) {
		console.log(response);
	})
	.catch(function (error) {
		console.error(error);
	});