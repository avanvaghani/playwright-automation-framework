import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import logger from '../utils/logger';

/**
 * LoginPage - Page object for OrangeHRM Login page.
 */
export class LoginPage extends BasePage {
    // Locators
    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly errorMessage: Locator;
    readonly requiredErrors: Locator;
    readonly loginTitle: Locator;

    constructor(page: Page) {
        super(page);
        this.usernameInput = page.locator('input[name="username"]');
        this.passwordInput = page.locator('input[name="password"]');
        this.loginButton = page.locator('button[type="submit"]');
        this.errorMessage = page.locator('.oxd-alert-content--error .oxd-text');
        this.requiredErrors = page.locator('.oxd-input-field-error-message');
        this.loginTitle = page.locator('.orangehrm-login-title');
    }

    /** Navigate to the login page */
    async goto(): Promise<void> {
        await this.navigateTo('/web/index.php/auth/login');
        await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => { });
        logger.info('Login page loaded');
    }

    /** Perform login with given credentials */
    async login(username: string, password: string): Promise<void> {
        logger.info(`Attempting login with username: ${username}`);
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
        // Use domcontentloaded instead of networkidle — the OrangeHRM demo
        // server can keep connections open after invalid logins, causing networkidle to hang.
        await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => { });
        await this.page.waitForTimeout(2000);
        await this.waitForPageLoad();
    }

    /** Get the error alert message text */
    async getErrorMessage(): Promise<string> {
        await this.errorMessage.first().waitFor({ state: 'visible', timeout: 5000 });
        const text = await this.errorMessage.first().textContent();
        logger.info(`Login error: ${text}`);
        return text?.trim() || '';
    }

    /** Get "Required" field validation messages */
    async getRequiredErrors(): Promise<string[]> {
        await this.requiredErrors.first().waitFor({ state: 'visible', timeout: 5000 });
        const errors = await this.requiredErrors.allTextContents();
        logger.info(`Required errors: ${errors.join(', ')}`);
        return errors.map((e) => e.trim());
    }

    /** Check if we are on the login page */
    async isLoginPage(): Promise<boolean> {
        await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => { });
        const isVisible = await this.loginButton.isVisible();
        logger.info(`Is login page: ${isVisible}`);
        return isVisible;
    }
}
