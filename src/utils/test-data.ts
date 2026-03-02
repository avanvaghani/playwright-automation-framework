/**
 * Centralized Test Data Management
 * All test data for UI and API tests in one place.
 */

// ─── UI Test Data ──────────────────────────────────────────────

export const LoginData = {
    valid: {
        username: 'Admin',
        password: 'admin123',
    },
    invalidUsername: {
        username: 'InvalidUser',
        password: 'admin123',
    },
    invalidPassword: {
        username: 'Admin',
        password: 'wrongpassword',
    },
    empty: {
        username: '',
        password: '',
    },
};

/** Generate a unique employee record for each test run */
export function generateEmployeeData() {
    const uid = Date.now().toString().slice(-6);
    return {
        firstName: `Test`,
        middleName: `M`,
        lastName: `Employee${uid}`,
        employeeId: uid,
        editedFirstName: `Edited`,
        editedLastName: `Updated${uid}`,
    };
}

export const PersonalDetails = {
    otherId: 'OTH-001',
    nationality: 'American',
    maritalStatus: 'Single',
    dateOfBirth: '1990-15-01',
    gender: 'Male',
};

// ─── API Test Data ─────────────────────────────────────────────

export function generatePetData(overrides: Partial<PetData> = {}): PetData {
    const id = Math.floor(Math.random() * 900000) + 100000;
    return {
        id,
        name: `TestPet_${id}`,
        category: { id: 1, name: 'Dogs' },
        photoUrls: ['https://example.com/photo.jpg'],
        tags: [{ id: 1, name: 'test-tag' }],
        status: 'available',
        ...overrides,
    };
}

export function generateOrderData(petId: number, overrides: Partial<OrderData> = {}): OrderData {
    const id = Math.floor(Math.random() * 9) + 1; // 1-9 for valid range
    return {
        id,
        petId,
        quantity: 1,
        shipDate: new Date().toISOString(),
        status: 'placed',
        complete: true,
        ...overrides,
    };
}

// ─── Type Definitions ──────────────────────────────────────────

export interface PetData {
    id: number;
    name: string;
    category: { id: number; name: string };
    photoUrls: string[];
    tags: { id: number; name: string }[];
    status: 'available' | 'pending' | 'sold';
}

export interface OrderData {
    id: number;
    petId: number;
    quantity: number;
    shipDate: string;
    status: 'placed' | 'approved' | 'delivered';
    complete: boolean;
}
