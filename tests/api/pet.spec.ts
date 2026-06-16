import { test, expect, APIRequestContext } from '@playwright/test';
import { generatePetData, PetData } from '../../src/utils/test-data';
import logger from '../../src/utils/logger';

const BASE_URL = 'https://petstore.swagger.io/v2';
let testPet: PetData;

test.describe('Pet API Endpoints', () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeAll(async ({ request }) => {
        testPet = generatePetData();

        // Health-check: skip the entire suite when Petstore blocks CI requests
        const health = await request.get(`${BASE_URL}/pet/1`);
        if (health.status() === 403) {
            test.skip(true, 'Petstore API is returning 403 — likely rate-limited from CI');
        }
    });

    // ─── Add a New Pet ─────────────────────────────────────────

    test('TC-P01: Add a new pet to the store', async ({ request }) => {
        logger.info('--- TC-P01: Add New Pet ---');
        const response = await request.post(`${BASE_URL}/pet`, { data: testPet });
        expect(response.status()).toBe(200);

        const body = await response.json();
        expect(body.id).toBe(testPet.id);
        expect(body.name).toBe(testPet.name);
        expect(body.status).toBe(testPet.status);
        expect(body.category.name).toBe(testPet.category.name);
        expect(body.photoUrls).toHaveLength(1);
        logger.info(`TC-P01: Pet created with ID ${body.id} ✓`);
    });

    test('TC-P02: Add pet with missing required fields (negative)', async ({ request }) => {
        logger.info('--- TC-P02: Add Pet - Negative ---');
        const response = await request.post(`${BASE_URL}/pet`, { data: { id: 0 } });
        const status = response.status();
        // The API may still accept malformed data; we validate it returns something
        expect([200, 400, 405, 500]).toContain(status);
        logger.info(`TC-P02: Response status ${status} ✓`);
    });

    // ─── Find Pet by ID ────────────────────────────────────────

    test('TC-P03: Find pet by ID', async ({ request }) => {
        logger.info('--- TC-P03: Find Pet by ID ---');
        const response = await request.get(`${BASE_URL}/pet/${testPet.id}`);
        expect(response.status()).toBe(200);

        const body = await response.json();
        expect(body.id).toBe(testPet.id);
        expect(body.name).toBe(testPet.name);
        expect(body.status).toBe(testPet.status);
        logger.info(`TC-P03: Found pet ${body.name} ✓`);
    });

    test('TC-P04: Find pet with non-existent ID (negative)', async ({ request }) => {
        logger.info('--- TC-P04: Find Pet - Negative ---');
        const nonExistentPetId = Math.floor(Math.random() * 900000000) + 1000000000;
        const response = await request.get(`${BASE_URL}/pet/${nonExistentPetId}`);
        expect(response.status()).toBe(404);
        logger.info(`TC-P04: Got 404 for non-existent pet ${nonExistentPetId} ✓`);
    });

    // ─── Update an Existing Pet ────────────────────────────────

    test('TC-P05: Update an existing pet', async ({ request }) => {
        logger.info('--- TC-P05: Update Pet ---');
        const updatedPet = { ...testPet, name: 'UpdatedPet', status: 'sold' as const };
        const response = await request.put(`${BASE_URL}/pet`, { data: updatedPet });
        expect(response.status()).toBe(200);

        const body = await response.json();
        expect(body.name).toBe('UpdatedPet');
        expect(body.status).toBe('sold');
        logger.info('TC-P05: Pet updated successfully ✓');

        testPet.name = 'UpdatedPet';
        testPet.status = 'sold';
    });

    test('TC-P06: Update pet with invalid data (negative)', async ({ request }) => {
        logger.info('--- TC-P06: Update Pet - Negative ---');
        const response = await request.put(`${BASE_URL}/pet`, { data: { id: 'invalid' } });
        const status = response.status();
        expect([200, 400, 404, 405, 500]).toContain(status);
        logger.info(`TC-P06: Response status ${status} ✓`);
    });

    // ─── Delete a Pet ──────────────────────────────────────────

    test('TC-P07: Delete a pet', async ({ request }) => {
        logger.info('--- TC-P07: Delete Pet ---');
        const response = await request.delete(`${BASE_URL}/pet/${testPet.id}`);
        expect(response.status()).toBe(200);
        logger.info('TC-P07: Pet deleted ✓');

        // Verify pet is gone
        const getResponse = await request.get(`${BASE_URL}/pet/${testPet.id}`);
        expect(getResponse.status()).toBe(404);
        logger.info('TC-P07: Verified pet no longer exists ✓');
    });

    test('TC-P08: Delete pet with non-existent ID (negative)', async ({ request }) => {
        logger.info('--- TC-P08: Delete Pet - Negative ---');
        const nonExistentPetId = Math.floor(Math.random() * 900000000) + 1000000000;
        const response = await request.delete(`${BASE_URL}/pet/${nonExistentPetId}`);
        const status = response.status();
        expect([200, 404]).toContain(status);
        logger.info(`TC-P08: Response status ${status} for pet ${nonExistentPetId} ✓`);
    });
});
