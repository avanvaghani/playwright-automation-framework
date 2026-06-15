import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import logger from '../utils/logger';

/**
 * EmployeeDetailsPage - Page object for PIM > Employee Personal Details.
 */
export class EmployeeDetailsPage extends BasePage {
    readonly firstNameInput: Locator;
    readonly middleNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly nicknameInput: Locator;
    readonly employeeIdInput: Locator;
    readonly nationalityDropdown: Locator;
    readonly maritalStatusDropdown: Locator;
    readonly dateOfBirthInput: Locator;
    readonly genderMaleRadio: Locator;
    readonly genderFemaleRadio: Locator;
    readonly savePersonalButton: Locator;
    readonly jobTab: Locator;
    readonly jobTitleDropdown: Locator;

    constructor(page: Page) {
        super(page);
        this.firstNameInput = page.locator('input[name="firstName"]');
        this.middleNameInput = page.locator('input[name="middleName"]');
        this.lastNameInput = page.locator('input[name="lastName"]');
        // Nickname field — labelled "Other Id" or use second input group
        this.nicknameInput = page.locator('.oxd-input-group', { hasText: 'Other Id' }).locator('input');
        this.employeeIdInput = page.locator('.oxd-input-group', { hasText: 'Employee Id' }).locator('input');
        // Dropdowns for Nationality and Marital Status
        this.nationalityDropdown = page.locator('.oxd-input-group', { hasText: 'Nationality' }).locator('.oxd-select-text');
        this.maritalStatusDropdown = page.locator('.oxd-input-group', { hasText: 'Marital Status' }).locator('.oxd-select-text');
        // Date of birth
        this.dateOfBirthInput = page.locator('.oxd-input-group', { hasText: 'Date of Birth' }).locator('input');
        // Gender radio buttons (role-based selectors are more stable and avoid strict-mode collisions)
        // Use exact matching: "Male" is a substring of "Female".
        this.genderMaleRadio = page.getByRole('radio', { name: 'Male', exact: true });
        this.genderFemaleRadio = page.getByRole('radio', { name: 'Female', exact: true });
        // Save button - first form's submit button (Personal Details section)
        this.savePersonalButton = page.locator('form button[type="submit"]').first();

        // Tabs / Job Details
        this.jobTab = page.getByRole('link', { name: 'Job', exact: true });
        this.jobTitleDropdown = page.locator('.oxd-input-group', { hasText: 'Job Title' }).locator('.oxd-select-text');
    }

    /** Edit employee name fields */
    async editName(firstName: string, lastName: string): Promise<void> {
        logger.info(`Editing employee name to: ${firstName} ${lastName}`);
        await this.firstNameInput.clear();
        await this.firstNameInput.fill(firstName);
        await this.lastNameInput.clear();
        await this.lastNameInput.fill(lastName);
    }

    /** Fill personal details section */
    async fillPersonalDetails(details: {
        otherId?: string;
        nationality?: string;
        maritalStatus?: string;
        dateOfBirth?: string;
        gender?: string;
    }): Promise<void> {
        logger.info(`Filling personal details: ${JSON.stringify(details)}`);

        // Wait for the form to be fully loaded
        await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => { });
        await this.page.waitForTimeout(1000);

        if (details.otherId) {
            await this.nicknameInput.waitFor({ state: 'visible', timeout: 5000 });
            await this.nicknameInput.click();
            await this.nicknameInput.press('Control+A');
            await this.nicknameInput.fill(details.otherId);
        }

        if (details.nationality) {
            await this.nationalityDropdown.click();
            await this.page.waitForTimeout(500);
            const option = this.page.locator('.oxd-select-option', { hasText: details.nationality });
            await option.waitFor({ state: 'visible', timeout: 5000 });
            await option.click();
            await this.page.waitForTimeout(300);
        }

        if (details.maritalStatus) {
            await this.maritalStatusDropdown.click();
            await this.page.waitForTimeout(500);
            const option = this.page.locator('.oxd-select-option', { hasText: details.maritalStatus });
            await option.waitFor({ state: 'visible', timeout: 5000 });
            await option.click();
            await this.page.waitForTimeout(300);
        }

        if (details.dateOfBirth) {
            await this.dateOfBirthInput.click();
            await this.dateOfBirthInput.press('Control+A');
            await this.dateOfBirthInput.fill(details.dateOfBirth);
            // Blur the field to trigger UI validation/formatting
            await this.dateOfBirthInput.press('Tab');
            await this.page.waitForTimeout(300);
        }

        if (details.gender === 'Male') {
            // OrangeHRM renders custom radios where a sibling <span> intercepts pointer events.
            // Force the check to reliably toggle the underlying input.
            await this.genderMaleRadio.check({ force: true });
        } else if (details.gender === 'Female') {
            await this.genderFemaleRadio.check({ force: true });
        }
    }

    /** Save personal details */
    async savePersonalDetails(): Promise<void> {
        logger.info('Saving personal details');
        // Scroll the save button into view and click
        await this.savePersonalButton.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(500);
        await this.savePersonalButton.click();
        // Wait for the server response
        await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => { });
        await this.page.waitForTimeout(2000);
        await this.waitForPageLoad();
    }

    /** Navigate to the Job tab */
    async gotoJobTab(): Promise<void> {
        await this.jobTab.click();
        await this.page.waitForURL('**/viewJobDetails/**', { timeout: 15000 });
        await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => { });
        await this.waitForPageLoad();
    }

    /**
     * Set the employee's Job Title.
     * If `jobTitle` is omitted, selects a known safe title ('QA Lead') or
     * the first option whose text is long enough to avoid substring collisions.
     * Returns the selected job title text.
     */
    async setJobTitle(jobTitle?: string): Promise<string> {
        await this.gotoJobTab();

        await this.jobTitleDropdown.waitFor({ state: 'visible', timeout: 10000 });
        await this.jobTitleDropdown.click();

        const options = this.page.locator('.oxd-select-option');
        await options.first().waitFor({ state: 'visible', timeout: 10000 });

        let option;
        if (jobTitle) {
            option = options.filter({ hasText: jobTitle }).first();
        } else {
            // Prefer a known stable title; fall back to the first option with
            // a text length >= 4 characters to avoid short/ambiguous values.
            const knownTitle = options.getByText('QA Lead', { exact: true });
            if (await knownTitle.count() > 0) {
                option = knownTitle.first();
            } else {
                const count = await options.count();
                option = options.first(); // default fallback
                for (let i = 0; i < count; i++) {
                    const text = (await options.nth(i).textContent())?.trim() || '';
                    if (text !== '-- Select --' && text.length >= 4) {
                        option = options.nth(i);
                        break;
                    }
                }
            }
        }

        const selectedText = (await option.textContent())?.trim() || jobTitle || '';
        await option.click();

        // Save on Job Details (usually the only Save button on this tab).
        const saveButton = this.page.locator('form').getByRole('button', { name: 'Save', exact: true }).first();
        await saveButton.scrollIntoViewIfNeeded();
        await saveButton.click();

        // Wait for server round-trip, then confirm success toast
        await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
        try {
            const toast = await this.getToastMessage();
            if (!toast.includes('Successfully Updated')) {
                logger.warn(`Unexpected toast after saving Job Details: "${toast}"`);
            }
            await this.waitForToastToDisappear();
        } catch {
            // Toast may have appeared and auto-dismissed before we could read it
            logger.warn('Job Details toast not captured — continuing (server may be slow)');
        }

        return selectedText;
    }

    /** Get the first name value */
    async getFirstName(): Promise<string> {
        const value = await this.firstNameInput.inputValue();
        return value.trim();
    }

    /** Get the last name value */
    async getLastName(): Promise<string> {
        const value = await this.lastNameInput.inputValue();
        return value.trim();
    }

    /** Get the employee ID value */
    async getEmployeeId(): Promise<string> {
        const value = await this.employeeIdInput.inputValue();
        return value.trim();
    }

    /** Get the nickname value */
    async getNickname(): Promise<string> {
        const value = await this.nicknameInput.inputValue();
        return value.trim();
    }
}
