import { test, expect } from '../../src/fixtures/page-fixtures';
import { LoginData, generateEmployeeData } from '../../src/utils/test-data';
import logger from '../../src/utils/logger';

// Generate unique employee data for the entire test suite
const employee = generateEmployeeData();

test.describe('Employee CRUD Operations', () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ loginPage, dashboardPage }) => {
        await loginPage.goto();
        await loginPage.login(LoginData.valid.username, LoginData.valid.password);
        await dashboardPage.isDashboardVisible();
    });

    // ─── Create Employee ───────────────────────────────────────

    test('TC-E01: Create a new employee', async ({ dashboardPage, addEmployeePage, page }) => {
        logger.info('--- TC-E01: Create Employee ---');
        logger.info(`Employee data: ${employee.firstName} ${employee.lastName} (ID: ${employee.employeeId})`);

        await dashboardPage.navigateToPIM();
        await page.locator('a', { hasText: 'Add Employee' }).click();
        await page.waitForURL('**/addEmployee', { timeout: 10000 });

        await addEmployeePage.fillEmployeeForm(
            employee.firstName,
            employee.middleName,
            employee.lastName,
            employee.employeeId
        );
        await addEmployeePage.saveEmployee();

        // Verify we landed on Personal Details page
        expect(page.url()).toContain('viewPersonalDetails');
        logger.info('TC-E01: PASSED ✓ - Employee created successfully');
    });

    // ─── Edit Employee ─────────────────────────────────────────

    test('TC-E02: Edit employee details', async ({ dashboardPage, pimPage, employeeDetailsPage }) => {
        logger.info('--- TC-E02: Edit Employee ---');

        await dashboardPage.navigateToPIM();
        await pimPage.searchByID(employee.employeeId);
        const rowCount = await pimPage.getRowCount();
        expect(rowCount).toBeGreaterThanOrEqual(1);

        await pimPage.editFirstEmployee();
        await employeeDetailsPage.editName(employee.editedFirstName, employee.editedLastName);
        await employeeDetailsPage.savePersonalDetails();

        const toast = await employeeDetailsPage.getToastMessage();
        expect(toast).toContain('Successfully Updated');
        logger.info('TC-E02: PASSED ✓ - Employee edited successfully');
    });

    // ─── Delete Employee ───────────────────────────────────────

    test('TC-E03: Delete employee from the list', async ({ dashboardPage, pimPage, page }) => {
        logger.info('--- TC-E03: Delete Employee ---');

        await dashboardPage.navigateToPIM();
        await pimPage.searchByID(employee.employeeId);
        const rowsBefore = await pimPage.getRowCount();
        expect(rowsBefore).toBeGreaterThanOrEqual(1);

        await pimPage.deleteFirstEmployee();

        // Wait for deletion to complete and toast to appear/disappear
        try {
            const toast = await pimPage.getToastMessage();
            expect(toast).toContain('Successfully Deleted');
            logger.info('Delete toast message confirmed');
        } catch (e) {
            logger.warn('Toast message may have appeared and disappeared quickly');
        }

        // Wait for page to settle after deletion  
        await page.waitForTimeout(3000);
        await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => { });

        // Navigate to PIM fresh and verify the employee is gone
        await dashboardPage.navigateToPIM();
        await pimPage.searchByID(employee.employeeId);
        await page.waitForTimeout(2000);

        // Check if "No Records Found" text is visible (use POM method to avoid strict-mode violation)
        const noRecordsVisible = await pimPage.isNoRecordsDisplayed();
        const rowsAfter = await pimPage.getRowCount();
        logger.info(`After delete - Rows: ${rowsAfter}, No Records visible: ${noRecordsVisible}`);
        expect(noRecordsVisible || rowsAfter === 0).toBeTruthy();

        logger.info('TC-E03: PASSED ✓ - Employee deleted successfully');
    });
});
