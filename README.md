# Playwright Test Automation Framework

[![Playwright Tests](https://github.com/avanvaghani/playwright-automation-framework/actions/workflows/playwright.yml/badge.svg)](https://github.com/avanvaghani/playwright-automation-framework/actions/workflows/playwright.yml)
[![Playwright](https://img.shields.io/badge/Playwright-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

A unified **Playwright + TypeScript** test automation framework covering:
- **UI Automation**: OrangeHRM Live Demo (Login, PIM Employee CRUD, Search, Personal Details)
- **API Automation**: Swagger Petstore API (Pet & Store endpoints)

## Notes / Instructions for Reviewers

- **Assignment mapping**: Each requirement in the problem statement is mapped to concrete specs/pages:
  - UI: `tests/ui/*.spec.ts` + POMs in `src/pages/*` (login/logout, employee create/search/edit/delete, personal details, Job Title search).
  - API: `tests/api/pet.spec.ts` and `tests/api/store.spec.ts` (all listed Pet + Store endpoints).
- **How to execute quickly**:
  - Install once: `npm install` then `npx playwright install chromium`.
  - Run **all tests**: `npm test` (runs UI + API projects).
  - Or run **only UI**: `npm run test:ui`, **only API**: `npm run test:api`.
- **Where to see evidence**:
  - HTML report: `npm run report` → opens `test-results/html-report/index.html` with per-test logs, traces, screenshots, and videos for failures.
  - Centralised logs: `logs/test-execution.log` (Winston, timestamped).
  - Test data strategy: `src/utils/test-data.ts` (factories for login data, employees, pets, and orders).
- **Design highlights**:
  - Page Object Model with Playwright fixtures (`src/fixtures/page-fixtures.ts`) so specs are thin and readable.
  - Positive/negative coverage called out by `TC-*` IDs in the tables below.
  - Error handling & flakiness controls are encapsulated in POMs (smart waits, toast helpers, autocomplete fallbacks), keeping specs stable against the OrangeHRM demo environment.

## 📋 Tech Stack

| Technology | Purpose |
|---|---|
| [Playwright](https://playwright.dev/) | Browser & API testing framework |
| TypeScript | Type-safe test development |
| Winston | Test execution logging |
| HTML Reporter | Test execution reports |

## 🏗️ Project Structure

```
playwright-automation-framework/
├── playwright.config.ts          # Playwright configuration (2 projects)
├── src/
│   ├── pages/                    # Page Object Model (POM)
│   │   ├── base.page.ts          # Shared utilities
│   │   ├── login.page.ts         # Login page interactions
│   │   ├── dashboard.page.ts     # Dashboard & navigation
│   │   ├── pim.page.ts           # Employee list & search
│   │   ├── addEmployee.page.ts   # Add Employee form
│   │   └── employeeDetails.page.ts # Personal details
│   ├── utils/
│   │   ├── logger.ts             # Winston logging
│   │   ├── test-data.ts          # Test data factories
│   │   └── api-helper.ts         # API request wrapper
│   └── fixtures/
│       └── page-fixtures.ts      # Custom Playwright fixtures
├── tests/
│   ├── ui/                       # UI test specs
│   │   ├── login.spec.ts
│   │   ├── employee-crud.spec.ts
│   │   ├── employee-search.spec.ts
│   │   └── employee-details.spec.ts
│   └── api/                      # API test specs
│       ├── pet.spec.ts
│       └── store.spec.ts
├── logs/                         # Test execution logs (auto-generated)
└── test-results/                 # Reports (auto-generated)
```

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** >= 18.x
- **npm** >= 9.x

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd playwright-automation-framework

# 2. Install dependencies
npm install

# 3. Install Playwright browsers
npx playwright install chromium
```

## ▶️ Test Execution Instructions

### Run All Tests
```bash
npm test
```

### Run UI Tests Only
```bash
npm run test:ui
```

### Run API Tests Only
```bash
npm run test:api
```

### Run UI Tests in Headed Mode (visible browser)
```bash
npm run test:headed
```

### Run a Specific Test File
```bash
npx playwright test tests/ui/login.spec.ts
npx playwright test tests/api/pet.spec.ts
```

## 📊 Test Execution Reports

### View HTML Report
```bash
npm run report
```
The HTML report is generated at `test-results/html-report/index.html` after each test run.

### Test Logs
Execution logs are written to `logs/test-execution.log` with timestamps.

## 🧪 Test Scenarios

### UI Tests (OrangeHRM)

| Test ID | Scenario | Type |
|---|---|---|
| TC-L01 | Login with valid credentials | ✅ Positive |
| TC-L02 | Logout from dashboard | ✅ Positive |
| TC-L03 | Login with invalid username | ❌ Negative |
| TC-L04 | Login with invalid password | ❌ Negative |
| TC-L05 | Login with empty credentials | ❌ Negative |
| TC-E01 | Create a new employee | ✅ Positive |
| TC-E02 | Edit employee details | ✅ Positive |
| TC-E03 | Delete employee from list | ✅ Positive |
| TC-S01 | Search employee by ID | ✅ Positive |
| TC-S02 | Search employee by name | ✅ Positive |
| TC-S03 | Search employee by Job Title | ✅ Positive |
| TC-S04 | Search non-existent employee | ❌ Negative |
| TC-PD01 | Submit personal details | ✅ Positive |
| TC-PD02 | Verify personal details persist | ✅ Positive |

### API Tests (Petstore Swagger)

| Test ID | Scenario | Type |
|---|---|---|
| TC-P01 | Add a new pet | ✅ Positive |
| TC-P02 | Add pet with missing fields | ❌ Negative |
| TC-P03 | Find pet by ID | ✅ Positive |
| TC-P04 | Find non-existent pet | ❌ Negative |
| TC-P05 | Update existing pet | ✅ Positive |
| TC-P06 | Update pet with invalid data | ❌ Negative |
| TC-P07 | Delete a pet | ✅ Positive |
| TC-P08 | Delete non-existent pet | ❌ Negative |
| TC-ST01 | Place an order | ✅ Positive |
| TC-ST02 | Place order with invalid data | ❌ Negative |
| TC-ST03 | Find order by ID | ✅ Positive |
| TC-ST04 | Find non-existent order | ❌ Negative |
| TC-ST05 | Delete purchase order | ✅ Positive |
| TC-ST06 | Delete non-existent order | ❌ Negative |

## ⚙️ Key Design Decisions

1. **Page Object Model (POM)**: All UI interactions abstracted into page objects for maintainability
2. **Custom Fixtures**: Playwright fixtures inject page objects into tests automatically
3. **Test Data Factories**: Unique data generated per run using `Date.now()` / `Math.random()`
4. **Serial Execution**: CRUD tests run in order (`serial mode`) to maintain data dependencies
5. **Auto-Cleanup**: Each test suite creates and cleans up its own test data
6. **Winston Logging**: Structured logs to console + file with timestamps and levels
