import { test, expect } from '../../src/fixtures/page-fixtures';
import { LoginData } from '../../src/utils/test-data';
import logger from '../../src/utils/logger';

test.describe('Login & Logout Workflows', () => {
    test.beforeEach(async ({ loginPage }) => {
        await loginPage.goto();
    });

    // ─── Positive Scenarios ────────────────────────────────────

    test('TC-L01: Login with valid credentials', async ({ loginPage, dashboardPage }) => {
        logger.info('--- TC-L01: Valid Login ---');
        await loginPage.login(LoginData.valid.username, LoginData.valid.password);
        const isVisible = await dashboardPage.isDashboardVisible();
        expect(isVisible).toBeTruthy();
        logger.info('TC-L01: PASSED ✓');
    });

    test('TC-L02: Logout from dashboard', async ({ loginPage, dashboardPage }) => {
        logger.info('--- TC-L02: Logout ---');
        await loginPage.login(LoginData.valid.username, LoginData.valid.password);
        await dashboardPage.isDashboardVisible();
        await dashboardPage.logout();
        const isLoginVisible = await loginPage.isLoginPage();
        expect(isLoginVisible).toBeTruthy();
        logger.info('TC-L02: PASSED ✓');
    });

    // ─── Negative Scenarios ────────────────────────────────────

    test('TC-L03: Login with invalid username', async ({ loginPage }) => {
        logger.info('--- TC-L03: Invalid Username ---');
        await loginPage.login(LoginData.invalidUsername.username, LoginData.invalidUsername.password);
        const error = await loginPage.getErrorMessage();
        expect(error).toContain('Invalid credentials');
        logger.info('TC-L03: PASSED ✓');
    });

    test('TC-L04: Login with invalid password', async ({ loginPage }) => {
        logger.info('--- TC-L04: Invalid Password ---');
        await loginPage.login(LoginData.invalidPassword.username, LoginData.invalidPassword.password);
        const error = await loginPage.getErrorMessage();
        expect(error).toContain('Invalid credentials');
        logger.info('TC-L04: PASSED ✓');
    });

    test('TC-L05: Login with empty credentials', async ({ loginPage }) => {
        logger.info('--- TC-L05: Empty Credentials ---');
        await loginPage.login(LoginData.empty.username, LoginData.empty.password);
        const errors = await loginPage.getRequiredErrors();
        expect(errors.length).toBeGreaterThanOrEqual(2);
        expect(errors[0]).toContain('Required');
        logger.info('TC-L05: PASSED ✓');
    });
});
