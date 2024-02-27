# Maintenance Log Emailer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)]

## Description

This is a small Node Express server that, once a week, fetches an xlsx file from Dropbox containing routine maintenance tasks required for a brewery. The JSON is then processed and tasks requiring completion in the following 7 and 30 days are organized and emailed to the maintenance person.

## Table of Contents

⋆[Installation](#Installation)
⋆[Usage](#Usage)
*[Links](#Links)
⋆[Credits](#Credits)
⋆[License](#License)
⋆[Features](#Features)
⋆[Contributions](#Contributions)
⋆[Test](#Contributions)

## Installation

After forking the repository, install the required dependencies using `npm install`.

## Usage

To use this application as-is, it is required that you have a dropbox account that contains an XLSX file that has dates in it and tasks that you would like to have emailed to yourself or someone else. Otherwise, the basic interface with the Dropbox SDK can be extrapolated and used in any apps. Assuming the former requirements are met, you will need to do the following: 

First visit dropbox.com/developers and create a new app. The dropbox SDK uses oauth2, so you will need to create a refresh token and save it as an environment variable within this application to allow the creation of an access token. 
Follow the instructions in this Dropbox Community forum posting in Link Text 1 below to obtain a refresh token. You will need the 'App_Key' and 'App_Secret' provided in your Dropbox App console. Copy the refresh link into .env (don't forget to remove the .example suffix from the file name)

Next, visit your dropbox account and create a Share Link for the folder or file you would like to access from the server. Copy the link into .env. 

Next, copy the App_key and App_Secret from the Dropbox App console into the .env file. 

Last, you will want to copy the email address and password for the email address that you would like to use for sending emails from within the server. If you use Gmail follow the instructions in Link Text 2 to create an App Password, otherwise your requests will be denied. 

Then start the server using `npm start`.


## Links

1. [Link Text](https://www.dropboxforum.com/t5/Dropbox-API-Support-Feedback/Issue-in-generating-access-token/m-p/592921/highlight/true#M27586)

2. [Link Text](https://support.google.com/mail/answer/185833?hl=en)

## Credits

N/A

## License

(https://opensource.org/licenses/MIT)

## Features

Cron-jobs, date formatting, dropbox sdk interface

## Contributions

N/A

## Test

N/A

## Questions

If you have any questions about the project you can reach out to me via email or GitHub with the information below.

> Email: brahm@brahmvanhouzen.studio

> GitHub: [brahmvanh](https://github.com/brahmvanh)
