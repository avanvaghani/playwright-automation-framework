import { Page, Locator } from '@playwright/test';
import logger from '../utils/logger';

/**
 * BasePage - Shared utilities for all page objects.
 */
export class BasePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /** Navigate to a path relative to baseURL */
    async navigateTo(path: string): Promise<void> {
        logger.info(`Navigating to: ${path}`);
        await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    }

    /** Wait for the loading spinner to disappear */
    async waitForPageLoad(): Promise<void> {
        const spinner = this.page.locator('.oxd-loading-spinner');
        await spinner.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {
            // spinner might not appear, that's fine
        });
    }

    /** Get toast message text (success/error notifications) */
    async getToastMessage(): Promise<string> {
        const toast = this.page.locator('.oxd-toast .oxd-text--toast-message');
        await toast.waitFor({ state: 'visible', timeout: 15000 });
        const text = await toast.textContent();
        logger.info(`Toast message: ${text}`);
        return text?.trim() || '';
    }

    /** Wait for toast to disappear */
    async waitForToastToDisappear(): Promise<void> {
        const toast = this.page.locator('.oxd-toast');
        await toast.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => { });
    }

    /** Get current page URL */
    getCurrentUrl(): string {
        return this.page.url();
    }

    /** Click a sidebar menu item by text */
    async clickSidebarMenu(menuText: string): Promise<void> {
        logger.info(`Clicking sidebar menu: ${menuText}`);
        await this.page.locator('.oxd-main-menu-item', { hasText: menuText }).click();
        await this.waitForPageLoad();
    }
}
