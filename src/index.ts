import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import express, { Request, NextFunction } from 'express';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { handleSendEmail } from './utils/helpers';
import { IResponse } from './types';
const PORT = process.env.PORT ?? 3000;

const app = express();

dotenv.config();

Sentry.init({
	dsn: process.env.SENTRY_DSN,
	integrations: [
		// enable HTTP calls tracing
		new Sentry.Integrations.Http({ tracing: true }),
		// enable Express.js middleware tracing
		new Sentry.Integrations.Express({ app }),
		nodeProfilingIntegration(),
	],
	// Performance Monitoring
	tracesSampleRate: 1.0, //  Capture 100% of the transactions
	// Set sampling rate for profiling - this is relative to tracesSampleRate
	profilesSampleRate: 1.0,
});

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());

// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// The error handler must be registered before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

// Optional fallthrough error handler
app.use(function onError(err: any, req: Request, res: IResponse, next: NextFunction) {
	// The error id is attached to `res.sentry` to be returned
	// and optionally displayed to the user for support.
	res.statusCode = 500;
	res.end(res.sentry + '\n');
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
	// Schedule the task to run every Tuesday at 04:00am
	cron.schedule(
		'0 4 * * 2',
		async () => {
			await handleSendEmail();
		},
		{ timezone: 'America/New_York' }
	);
});
