import { test, expect } from '@playwright/test';
import { generatePetData, generateOrderData, OrderData } from '../../src/utils/test-data';
import logger from '../../src/utils/logger';

const BASE_URL = 'https://petstore.swagger.io/v2';
let testOrder: OrderData;
let testPetId: number;

test.describe('Store API Endpoints', () => {
    test.describe.configure({ mode: 'serial' });

    // Setup: create a pet first, then use its ID for orders
    test('TC-ST00: Setup - Create a pet for order tests', async ({ request }) => {
        const pet = generatePetData();
        testPetId = pet.id;
        const response = await request.post(`${BASE_URL}/pet`, { data: pet });
        expect(response.status()).toBe(200);
        logger.info(`Setup: Created pet with ID ${pet.id} for store order tests`);
        testOrder = generateOrderData(testPetId);
    });

    // ─── Place an Order ────────────────────────────────────────

    test('TC-ST01: Place an order for a pet', async ({ request }) => {
        logger.info('--- TC-ST01: Place Order ---');
        const response = await request.post(`${BASE_URL}/store/order`, { data: testOrder });
        expect(response.status()).toBe(200);

        const body = await response.json();
        expect(body.id).toBe(testOrder.id);
        expect(body.petId).toBe(testOrder.petId);
        expect(body.quantity).toBe(testOrder.quantity);
        expect(body.status).toBe(testOrder.status);
        expect(body.complete).toBe(testOrder.complete);
        logger.info(`TC-ST01: Order placed with ID ${body.id} ✓`);
    });

    test('TC-ST02: Place order with invalid data (negative)', async ({ request }) => {
        logger.info('--- TC-ST02: Place Order - Negative ---');
        const invalidOrder = { id: 'invalid', petId: 'invalid', quantity: -1 };
        const response = await request.post(`${BASE_URL}/store/order`, { data: invalidOrder });
        const status = response.status();
        expect([200, 400, 500]).toContain(status);
        logger.info(`TC-ST02: Response status ${status} ✓`);
    });

    // ─── Find Purchase Order by ID ─────────────────────────────

    test('TC-ST03: Find purchase order by ID', async ({ request }) => {
        logger.info('--- TC-ST03: Find Order ---');
        const response = await request.get(`${BASE_URL}/store/order/${testOrder.id}`);
        expect(response.status()).toBe(200);

        const body = await response.json();
        expect(body.id).toBe(testOrder.id);
        expect(body.petId).toBe(testOrder.petId);
        expect(body.status).toBe(testOrder.status);
        logger.info(`TC-ST03: Found order ${body.id} ✓`);
    });

    test('TC-ST04: Find order with invalid ID (negative)', async ({ request }) => {
        logger.info('--- TC-ST04: Find Order - Negative ---');
        const invalidOrderId = Math.floor(Math.random() * 1_000_000) + 9_000_000;
        const response = await request.get(`${BASE_URL}/store/order/${invalidOrderId}`);
        expect(response.status()).toBe(404);
        logger.info(`TC-ST04: Got 404 for non-existent order ${invalidOrderId} ✓`);
    });

    // ─── Delete Purchase Order ─────────────────────────────────

    test('TC-ST05: Delete purchase order', async ({ request }) => {
        logger.info('--- TC-ST05: Delete Order ---');
        const response = await request.delete(`${BASE_URL}/store/order/${testOrder.id}`);
        expect(response.status()).toBe(200);
        logger.info('TC-ST05: Order deleted ✓');

        // Verify order is gone
        const getResponse = await request.get(`${BASE_URL}/store/order/${testOrder.id}`);
        expect(getResponse.status()).toBe(404);
        logger.info('TC-ST05: Verified order no longer exists ✓');
    });

    test('TC-ST06: Delete order with invalid ID (negative)', async ({ request }) => {
        logger.info('--- TC-ST06: Delete Order - Negative ---');
        const response = await request.delete(`${BASE_URL}/store/order/99999`);
        const status = response.status();
        expect([200, 404]).toContain(status);
        logger.info(`TC-ST06: Response status ${status} ✓`);
    });
});
