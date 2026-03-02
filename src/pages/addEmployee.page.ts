import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import logger from '../utils/logger';

/**
 * AddEmployeePage - Page object for PIM > Add Employee form.
 */
export class AddEmployeePage extends BasePage {
    readonly firstNameInput: Locator;
    readonly middleNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly employeeIdInput: Locator;
    readonly saveButton: Locator;
    readonly cancelButton: Locator;

    constructor(page: Page) {
        super(page);
        this.firstNameInput = page.locator('input[name="firstName"]');
        this.middleNameInput = page.locator('input[name="middleName"]');
        this.lastNameInput = page.locator('input[name="lastName"]');
        // Employee ID uses a label-based locator since the input has no name attribute
        this.employeeIdInput = page.locator('.oxd-input-group', { hasText: 'Employee Id' }).locator('input');
        this.saveButton = page.locator('button[type="submit"]');
        this.cancelButton = page.locator('button', { hasText: 'Cancel' });
    }

    /** Fill in the employee creation form */
    async fillEmployeeForm(
        firstName: string,
        middleName: string,
        lastName: string,
        employeeId?: string
    ): Promise<void> {
        logger.info(`Filling employee form: ${firstName} ${middleName} ${lastName}`);
        await this.firstNameInput.fill(firstName);
        await this.middleNameInput.fill(middleName);
        await this.lastNameInput.fill(lastName);

        if (employeeId) {
            await this.employeeIdInput.clear();
            await this.employeeIdInput.fill(employeeId);
            logger.info(`Set employee ID: ${employeeId}`);
        }
    }

    /** Get the auto-generated employee ID from the form */
    async getEmployeeId(): Promise<string> {
        const value = await this.employeeIdInput.inputValue();
        logger.info(`Employee ID: ${value}`);
        return value;
    }

    /** Save the new employee */
    async saveEmployee(): Promise<void> {
        logger.info('Saving new employee');
        await this.saveButton.click();
        // After save, we should redirect to Personal Details page
        await this.page.waitForURL('**/viewPersonalDetails/**', { timeout: 30000 });
        await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => { });
        await this.waitForPageLoad();
        logger.info('Employee saved — redirected to Personal Details');
    }
}
