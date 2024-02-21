import fetch from 'isomorphic-fetch';

// dropbox-scope-check.ts

// Define your Dropbox access token
const accessToken = process.env.DROPBOX_ACCESS_TOKEN;

// Define the URL for the /oauth2/token/check endpoint
const tokenCheckUrl = 'https://api.dropboxapi.com/oauth2/token/check';

// Make a POST request to the /oauth2/token/check endpoint
fetch(tokenCheckUrl, {
	method: 'POST',
	headers: {
		Authorization: `Bearer ${accessToken}`,
		'Content-Type': 'application/json',
	},
	body: JSON.stringify({ token: accessToken }),
})
	.then((response) => {
		if (response.ok) {
			return response.json();
		} else {
			throw new Error(`Failed to check token info: ${response.statusText}`);
		}
	})
	.then((data) => {
		console.log('Token info:', data);
		// Check if the required scope is listed among the granted scopes
		const scopes = data.scope;
		if (scopes.includes('files.metadata.read')) {
			console.log('Required scope is granted');
		} else {
			console.log('Required scope is missing');
		}
	})
	.catch((error) => {
		console.error('Error checking token info:', error);
	});
