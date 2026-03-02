import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import logger from '../utils/logger';

/**
 * DashboardPage - Page object for OrangeHRM Dashboard.
 */
export class DashboardPage extends BasePage {
    readonly dashboardTitle: Locator;
    readonly userDropdown: Locator;
    readonly logoutLink: Locator;

    constructor(page: Page) {
        super(page);
        this.dashboardTitle = page.locator('h6.oxd-topbar-header-breadcrumb-module');
        this.userDropdown = page.locator('.oxd-userdropdown-tab');
        this.logoutLink = page.locator('a.oxd-userdropdown-link', { hasText: 'Logout' });
    }

    /** Wait for dashboard to load and verify it's visible */
    async isDashboardVisible(): Promise<boolean> {
        logger.info('Checking if dashboard is visible...');
        try {
            // Wait for URL to match dashboard pattern
            await this.page.waitForURL('**/dashboard/index', { timeout: 30000 });
            await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => { });
            await this.waitForPageLoad();
            await this.dashboardTitle.waitFor({ state: 'visible', timeout: 15000 });
            const text = await this.dashboardTitle.textContent();
            logger.info(`Dashboard title text: "${text}"`);
            return text?.trim() === 'Dashboard';
        } catch (e) {
            logger.error(`Dashboard not visible: ${e}`);
            return false;
        }
    }

    /** Navigate to PIM module via sidebar */
    async navigateToPIM(): Promise<void> {
        logger.info('Navigating to PIM module');
        await this.clickSidebarMenu('PIM');
        await this.page.waitForURL('**/pim/**', { timeout: 15000 });
        await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => { });
        await this.waitForPageLoad();
    }

    /** Perform logout */
    async logout(): Promise<void> {
        logger.info('Performing logout');
        await this.userDropdown.waitFor({ state: 'visible', timeout: 10000 });
        await this.userDropdown.click();
        await this.logoutLink.waitFor({ state: 'visible', timeout: 5000 });
        await this.logoutLink.click();
        await this.page.waitForURL('**/auth/login', { timeout: 15000 });
        logger.info('Logout successful — redirected to login page');
    }
}
