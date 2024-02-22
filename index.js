const dropbox = require('dropbox-v2-api');


const dbx = dropbox.authenticate({
  client_id: process.env.DROPBOX_APP_KEY,
  client_secret: process.env.DROPBOX_APP_SECRET,
  redirect_uri: 'http://localhost:3000/auth',
  token_access_type: 'offline',
});

dbx.auth.g
