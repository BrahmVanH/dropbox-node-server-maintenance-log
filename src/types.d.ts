import { Response } from 'express';

export interface IMaintenanceTask {
	title: string;
	description: string;
	lastCompleted: string;
	completeBy: string;
}

export interface IResponse extends Response {
	sentry?: string;
}