import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { PIMPage } from '../pages/pim.page';
import { AddEmployeePage } from '../pages/addEmployee.page';
import { EmployeeDetailsPage } from '../pages/employeeDetails.page';

/**
 * Custom Playwright fixtures that provide Page Object instances to tests.
 */
type PageFixtures = {
    loginPage: LoginPage;
    dashboardPage: DashboardPage;
    pimPage: PIMPage;
    addEmployeePage: AddEmployeePage;
    employeeDetailsPage: EmployeeDetailsPage;
};

export const test = base.extend<PageFixtures>({
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },
    dashboardPage: async ({ page }, use) => {
        await use(new DashboardPage(page));
    },
    pimPage: async ({ page }, use) => {
        await use(new PIMPage(page));
    },
    addEmployeePage: async ({ page }, use) => {
        await use(new AddEmployeePage(page));
    },
    employeeDetailsPage: async ({ page }, use) => {
        await use(new EmployeeDetailsPage(page));
    },
});

export { expect } from '@playwright/test';
