import { test, expect } from '../../src/fixtures/page-fixtures';
import { LoginData, generateEmployeeData } from '../../src/utils/test-data';
import logger from '../../src/utils/logger';

// Create a fresh employee for search tests
const employee = generateEmployeeData();
let employeeJobTitle = '';

test.describe('Employee Search & Filter', () => {
    test.describe.configure({ mode: 'serial' });

    // Setup: create an employee to search for
    test('TC-S00: Setup - Create employee for search tests', async ({
        loginPage,
        dashboardPage,
        addEmployeePage,
        employeeDetailsPage,
        page,
    }) => {
        logger.info('--- TC-S00: Setup - Creating employee for search ---');
        await loginPage.goto();
        await loginPage.login(LoginData.valid.username, LoginData.valid.password);
        await dashboardPage.isDashboardVisible();
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
        expect(page.url()).toContain('viewPersonalDetails');

        // Set a Job Title so we can verify the created employee via Job Title filter.
        employeeJobTitle = await employeeDetailsPage.setJobTitle();
        logger.info(`Setup: Job Title set to "${employeeJobTitle}"`);
        logger.info('Setup complete');
    });

    // ─── Positive Search Scenarios ─────────────────────────────

    test('TC-S01: Search employee by Employee ID', async ({ loginPage, dashboardPage, pimPage }) => {
        logger.info('--- TC-S01: Search by Employee ID ---');
        await loginPage.goto();
        await loginPage.login(LoginData.valid.username, LoginData.valid.password);
        await dashboardPage.isDashboardVisible();
        await dashboardPage.navigateToPIM();

        await pimPage.searchByID(employee.employeeId);
        const rowCount = await pimPage.getRowCount();
        expect(rowCount).toBeGreaterThanOrEqual(1);

        const rowData = await pimPage.getFirstRowData();
        // The ID column typically shows the employee ID
        expect(rowData.join(' ')).toContain(employee.employeeId);
        logger.info('TC-S01: PASSED ✓');
    });

    test('TC-S02: Search employee by Employee Name', async ({ loginPage, dashboardPage, pimPage }) => {
        logger.info('--- TC-S02: Search by Employee Name ---');
        await loginPage.goto();
        await loginPage.login(LoginData.valid.username, LoginData.valid.password);
        await dashboardPage.isDashboardVisible();
        await dashboardPage.navigateToPIM();

        // Autocomplete works best when typing a short unique prefix, then selecting the correct suggestion.
        await pimPage.searchByName(employee.firstName, employee.lastName);
        const rowCount = await pimPage.getRowCount();
        expect(rowCount).toBeGreaterThanOrEqual(1);
        logger.info('TC-S02: PASSED ✓');
    });

    test('TC-S03: Search employee by Job Title', async ({ loginPage, dashboardPage, pimPage }) => {
        logger.info('--- TC-S03: Search by Job Title ---');
        await loginPage.goto();
        await loginPage.login(LoginData.valid.username, LoginData.valid.password);
        await dashboardPage.isDashboardVisible();
        await dashboardPage.navigateToPIM();

        await pimPage.searchByJobTitle(employeeJobTitle);
        const isPresent = await pimPage.isEmployeeIdPresent(employee.employeeId);
        expect(isPresent).toBeTruthy();
        logger.info('TC-S03: PASSED ✓');
    });

    // ─── Negative Search Scenario ──────────────────────────────

    test('TC-S04: Search with non-existent employee name', async ({
        loginPage,
        dashboardPage,
        pimPage,
    }) => {
        logger.info('--- TC-S04: Search non-existent ---');
        await loginPage.goto();
        await loginPage.login(LoginData.valid.username, LoginData.valid.password);
        await dashboardPage.isDashboardVisible();
        await dashboardPage.navigateToPIM();

        await pimPage.searchByName('NonExistentXYZ99999');
        const isNoRecords = await pimPage.isNoRecordsDisplayed();
        // Either no records message shows, or empty results
        const rowCount = await pimPage.getRowCount();
        expect(isNoRecords || rowCount === 0).toBeTruthy();
        logger.info('TC-S04: PASSED ✓');
    });

    // Cleanup: delete the test employee
    test('TC-S05: Cleanup - Delete search test employee', async ({
        loginPage,
        dashboardPage,
        pimPage,
    }) => {
        logger.info('--- TC-S05: Cleanup ---');
        await loginPage.goto();
        await loginPage.login(LoginData.valid.username, LoginData.valid.password);
        await dashboardPage.isDashboardVisible();
        await dashboardPage.navigateToPIM();

        await pimPage.searchByID(employee.employeeId);
        const rowCount = await pimPage.getRowCount();
        if (rowCount > 0) {
            await pimPage.deleteFirstEmployee();
            try {
                const toast = await pimPage.getToastMessage();
                expect(toast).toContain('Successfully Deleted');
            } catch (e) {
                logger.warn('Toast may have disappeared quickly during cleanup');
            }
        } else {
            logger.info('Employee already deleted or not found — skipping cleanup');
        }
        logger.info('Cleanup complete');
    });
});
