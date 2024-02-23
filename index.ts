import express from "express";
import path from "path";
import { configDotenv } from "dotenv";

const PORT = process.env.PORT || 3000;

const app = express();

configDotenv();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});




