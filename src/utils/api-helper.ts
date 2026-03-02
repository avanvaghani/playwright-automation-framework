import { APIRequestContext } from '@playwright/test';
import logger from './logger';

/**
 * API Helper - Wraps Playwright's API request context with logging and error handling.
 */
export class ApiHelper {
    private request: APIRequestContext;
    private baseURL: string;

    constructor(request: APIRequestContext, baseURL: string = 'https://petstore.swagger.io/v2') {
        this.request = request;
        this.baseURL = baseURL;
    }

    async get(endpoint: string) {
        const url = `${this.baseURL}${endpoint}`;
        logger.info(`GET ${url}`);
        try {
            const response = await this.request.get(url);
            logger.info(`GET ${url} → ${response.status()}`);
            return response;
        } catch (error) {
            logger.error(`GET ${url} failed: ${error}`);
            throw error;
        }
    }

    async post(endpoint: string, data?: object) {
        const url = `${this.baseURL}${endpoint}`;
        logger.info(`POST ${url} | Body: ${JSON.stringify(data)}`);
        try {
            const response = await this.request.post(url, { data });
            logger.info(`POST ${url} → ${response.status()}`);
            return response;
        } catch (error) {
            logger.error(`POST ${url} failed: ${error}`);
            throw error;
        }
    }

    async put(endpoint: string, data?: object) {
        const url = `${this.baseURL}${endpoint}`;
        logger.info(`PUT ${url} | Body: ${JSON.stringify(data)}`);
        try {
            const response = await this.request.put(url, { data });
            logger.info(`PUT ${url} → ${response.status()}`);
            return response;
        } catch (error) {
            logger.error(`PUT ${url} failed: ${error}`);
            throw error;
        }
    }

    async delete(endpoint: string) {
        const url = `${this.baseURL}${endpoint}`;
        logger.info(`DELETE ${url}`);
        try {
            const response = await this.request.delete(url);
            logger.info(`DELETE ${url} → ${response.status()}`);
            return response;
        } catch (error) {
            logger.error(`DELETE ${url} failed: ${error}`);
            throw error;
        }
    }
}
