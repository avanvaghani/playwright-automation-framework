import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import logger from '../utils/logger';

/**
 * PIMPage - Page object for the PIM Employee List page.
 */
export class PIMPage extends BasePage {
    // Search/Filter inputs
    readonly employeeNameGroup: Locator;
    readonly employeeNameInput: Locator;
    readonly employeeIdInput: Locator;
    readonly jobTitleDropdown: Locator;
    readonly searchButton: Locator;
    readonly resetButton: Locator;

    // Table
    readonly tableRows: Locator;
    readonly noRecordsText: Locator;
    readonly addEmployeeButton: Locator;

    // Delete confirmation dialog
    readonly confirmDeleteButton: Locator;

    constructor(page: Page) {
        super(page);

        // Search/filter locators using label-based selectors for stability
        this.employeeNameGroup = page.locator('.oxd-input-group', { hasText: 'Employee Name' });
        this.employeeNameInput = this.employeeNameGroup.locator('input');
        this.employeeIdInput = page.locator('.oxd-input-group', { hasText: 'Employee Id' }).locator('input');
        this.jobTitleDropdown = page.locator('.oxd-input-group', { hasText: 'Job Title' }).locator('.oxd-select-text');
        this.searchButton = page.locator('button[type="submit"]');
        this.resetButton = page.locator('button[type="reset"]');

        // Table rows (each row is .oxd-table-card)
        this.tableRows = page.locator('.oxd-table-card');
        this.noRecordsText = page.locator('span', { hasText: 'No Records Found' });

        // Add Employee button
        this.addEmployeeButton = page.locator('button', { hasText: ' Add' });

        // Delete confirm
        this.confirmDeleteButton = page.locator('.orangehrm-modal-footer .oxd-button--label-danger');
    }

    /** Navigate to PIM Employee List */
    async goto(): Promise<void> {
        await this.navigateTo('/web/index.php/pim/viewEmployeeList');
        await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => { });
        await this.waitForPageLoad();
        logger.info('PIM Employee List page loaded');
    }

    /** Click Add Employee button */
    async clickAddEmployee(): Promise<void> {
        logger.info('Clicking Add Employee button');
        await this.addEmployeeButton.click();
        await this.page.waitForURL('**/addEmployee', { timeout: 10000 });
    }

    /** Search by Employee Name (autocomplete). Provide `expectedLastName` to select the right suggestion. */
    async searchByName(name: string, expectedLastName?: string): Promise<void> {
        logger.info(`Searching employee by name: ${name}${expectedLastName ? ` (expected: ${expectedLastName})` : ''}`);
        await this.resetFilters();
        await this.employeeNameInput.click();
        await this.employeeNameInput.fill(name);

        // OrangeHRM uses an autocomplete widget; the dropdown is rendered inside the input group's container.
        const dropdown = this.employeeNameGroup.locator('.oxd-autocomplete-dropdown');
        const optionLocator = expectedLastName
            ? dropdown.locator('.oxd-autocomplete-option', { hasText: expectedLastName }).first()
            : dropdown.locator('.oxd-autocomplete-option').first();

        try {
            await dropdown.waitFor({ state: 'visible', timeout: 5000 });
            await optionLocator.waitFor({ state: 'visible', timeout: 5000 });
            await optionLocator.click();
        } catch {
            // Fallback: keyboard selection if the DOM structure differs or suggestions are slow.
            logger.warn('Autocomplete selection not detected — falling back to keyboard selection');
            await this.employeeNameInput.press('ArrowDown').catch(() => { });
            await this.employeeNameInput.press('Enter').catch(() => { });
        }
        await this.searchButton.click();
        await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => { });
        await this.waitForPageLoad();
    }

    /** Search by Employee ID */
    async searchByID(id: string): Promise<void> {
        logger.info(`Searching employee by ID: ${id}`);
        await this.resetFilters();
        await this.employeeIdInput.fill(id);
        await this.searchButton.click();
        await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => { });
        await this.waitForPageLoad();
        // Small wait for table to render
        await this.page.waitForTimeout(1000);
    }

    /** Search by Job Title (dropdown) */
    async searchByJobTitle(jobTitle: string): Promise<void> {
        logger.info(`Searching employee by Job Title: ${jobTitle}`);
        await this.resetFilters();
        await this.jobTitleDropdown.click();
        const option = this.page.locator('.oxd-select-option', { hasText: jobTitle });
        await option.waitFor({ state: 'visible', timeout: 5000 });
        await option.click();
        await this.searchButton.click();
        await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => { });
        await this.waitForPageLoad();
    }

    /** Reset search filters */
    async resetFilters(): Promise<void> {
        await this.resetButton.click();
        await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => { });
        await this.waitForPageLoad();
    }

    /** Get number of rows in the employee table */
    async getRowCount(): Promise<number> {
        await this.page.waitForTimeout(1000);
        const count = await this.tableRows.count();
        logger.info(`Employee table row count: ${count}`);
        return count;
    }

    /** Check if "No Records Found" is displayed */
    async isNoRecordsDisplayed(): Promise<boolean> {
        try {
            await this.noRecordsText.waitFor({ state: 'visible', timeout: 5000 });
            logger.info('No Records Found message displayed');
            return true;
        } catch {
            return false;
        }
    }

    /** Delete the first employee in the table */
    async deleteFirstEmployee(): Promise<void> {
        logger.info('Deleting first employee in the table');
        const trashIcon = this.tableRows.first().locator('.oxd-icon.bi-trash');
        await trashIcon.click();
        await this.confirmDeleteButton.waitFor({ state: 'visible', timeout: 5000 });
        await this.confirmDeleteButton.click();
        await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => { });
        await this.waitForPageLoad();
    }

    /** Click edit icon for the first employee in the table */
    async editFirstEmployee(): Promise<void> {
        logger.info('Clicking edit on first employee');
        const editIcon = this.tableRows.first().locator('.oxd-icon.bi-pencil-fill');
        await editIcon.click();
        await this.page.waitForURL('**/viewPersonalDetails/**', { timeout: 15000 });
        await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => { });
        await this.waitForPageLoad();
    }

    /** Get text content of all cells for the first table row */
    async getFirstRowData(): Promise<string[]> {
        const cells = this.tableRows.first().locator('.oxd-table-cell');
        const count = await cells.count();
        const data: string[] = [];
        for (let i = 0; i < count; i++) {
            const text = await cells.nth(i).textContent();
            data.push(text?.trim() || '');
        }
        logger.info(`First row data: ${data.join(' | ')}`);
        return data;
    }

    /** Check whether any result row contains the given Employee ID */
    async isEmployeeIdPresent(employeeId: string): Promise<boolean> {
        const rows = await this.tableRows.count();
        for (let i = 0; i < rows; i++) {
            const text = (await this.tableRows.nth(i).textContent()) || '';
            if (text.includes(employeeId)) return true;
        }
        return false;
    }
}
