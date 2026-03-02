import { test, expect } from '../../src/fixtures/page-fixtures';
import { LoginData, generateEmployeeData, PersonalDetails } from '../../src/utils/test-data';
import logger from '../../src/utils/logger';

const employee = generateEmployeeData();

test.describe('Employee Personal Details Validation', () => {
    test.describe.configure({ mode: 'serial' });

    // Setup: Create employee
    test('TC-PD00: Setup - Create employee for personal details tests', async ({
        loginPage,
        dashboardPage,
        addEmployeePage,
        page,
    }) => {
        logger.info('--- TC-PD00: Setup ---');
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
        logger.info('Setup complete');
    });

    // ─── Submit and Validate Personal Details ──────────────────

    test('TC-PD01: Submit personal details and verify data is saved', async ({
        loginPage,
        dashboardPage,
        pimPage,
        employeeDetailsPage,
        page,
    }) => {
        logger.info('--- TC-PD01: Submit Personal Details ---');
        await loginPage.goto();
        await loginPage.login(LoginData.valid.username, LoginData.valid.password);
        await dashboardPage.isDashboardVisible();
        await dashboardPage.navigateToPIM();

        await pimPage.searchByID(employee.employeeId);
        await pimPage.editFirstEmployee();

        // Fill personal details
        await employeeDetailsPage.fillPersonalDetails({
            otherId: PersonalDetails.otherId,
            nationality: PersonalDetails.nationality,
            maritalStatus: PersonalDetails.maritalStatus,
            dateOfBirth: PersonalDetails.dateOfBirth,
            gender: PersonalDetails.gender,
        });

        await employeeDetailsPage.savePersonalDetails();

        // Wait for save and try to catch the toast
        // On delay-heavy demo servers, the toast may appear and vanish quickly
        try {
            const toast = await employeeDetailsPage.getToastMessage();
            logger.info(`Toast received: ${toast}`);
            expect(toast).toContain('Successfully Updated');
        } catch {
            // Fallback: verify data saved by reloading and checking
            logger.warn('Toast not captured – reloading to verify persistence');
            await page.reload({ waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(3000);
        }

        // Always verify data persisted regardless of toast result
        const otherId = await employeeDetailsPage.getNickname();
        if (otherId === PersonalDetails.otherId) {
            logger.info('TC-PD01: Data persistence confirmed ✓');
        } else {
            logger.info(`TC-PD01: otherId was "${otherId}", expected "${PersonalDetails.otherId}"`);
        }
        // Pass the test if the otherId matches (save was successful)
        expect(otherId).toBe(PersonalDetails.otherId);
        logger.info('TC-PD01: PASSED ✓');
    });

    test('TC-PD02: Verify personal details persist after page reload', async ({
        loginPage,
        dashboardPage,
        pimPage,
        employeeDetailsPage,
    }) => {
        logger.info('--- TC-PD02: Verify Persistence ---');
        await loginPage.goto();
        await loginPage.login(LoginData.valid.username, LoginData.valid.password);
        await dashboardPage.isDashboardVisible();
        await dashboardPage.navigateToPIM();

        await pimPage.searchByID(employee.employeeId);
        await pimPage.editFirstEmployee();

        // Verify the data persisted
        const firstName = await employeeDetailsPage.getFirstName();
        const lastName = await employeeDetailsPage.getLastName();
        expect(firstName).toBe(employee.firstName);
        expect(lastName).toBe(employee.lastName);

        const otherId = await employeeDetailsPage.getNickname();
        expect(otherId).toBe(PersonalDetails.otherId);

        logger.info('TC-PD02: PASSED ✓');
    });

    // Cleanup
    test('TC-PD03: Cleanup - Delete test employee', async ({ loginPage, dashboardPage, pimPage }) => {
        logger.info('--- TC-PD03: Cleanup ---');
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
