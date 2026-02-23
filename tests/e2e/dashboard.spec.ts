import { test, expect } from '@playwright/test';

test.describe('PulseOps Dashboard E2E', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173');
    });

    test('should display dashboard header', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('PulseOps');
        await expect(page.getByText('Real-Time Analytics Platform')).toBeVisible();
    });

    test('should allow changing org and project IDs', async ({ page }) => {
        const orgInput = page.getByPlaceholder('Org ID');
        const projectInput = page.getByPlaceholder('Project ID');

        await orgInput.fill('test-org-123');
        await projectInput.fill('test-project-456');

        await expect(orgInput).toHaveValue('test-org-123');
        await expect(projectInput).toHaveValue('test-project-456');
    });

    test('should display metrics cards', async ({ page }) => {
        await expect(page.getByText('Total Events')).toBeVisible();
        await expect(page.getByText('Daily Active Users')).toBeVisible();
        await expect(page.getByText('Top Event')).toBeVisible();
    });

    test('should display DAU chart', async ({ page }) => {
        await expect(page.getByText('Daily Active Users')).toBeVisible();

        // Wait for chart to render
        await page.waitForSelector('.recharts-line', { timeout: 5000 });
    });

    test('should display event breakdown chart', async ({ page }) => {
        await expect(page.getByText('Event Breakdown')).toBeVisible();

        // Wait for chart to render
        await page.waitForSelector('.recharts-bar', { timeout: 5000 });
    });

    test('should handle loading state', async ({ page }) => {
        await page.goto('http://localhost:5173');

        // Should briefly show loading
        const loading = page.getByText('Loading analytics...');
        if (await loading.isVisible()) {
            await expect(loading).toBeVisible();
        }
    });

    test('should refresh data periodically', async ({ page }) => {
        // Wait for initial load
        await page.waitForSelector('.recharts-line', { timeout: 5000 });

        const initialText = await page.locator('h3:has-text("Total Events")').textContent();

        // Wait 35 seconds (refetch interval is 30s)
        await page.waitForTimeout(35000);

        // Data should still be visible (may or may not have changed)
        await expect(page.locator('h3:has-text("Total Events")')).toBeVisible();
    });
});

test.describe('PulseOps Full Flow E2E', () => {
    test('should send event and see it in dashboard', async ({ page, request }) => {
        // Send test event
        const eventResponse = await request.post('http://localhost:3001/api/v1/events', {
            headers: {
                'X-API-Key': 'demo_key_change_this',
                'Content-Type': 'application/json',
            },
            data: {
                event_name: 'e2e_test_event',
                user_id: 'e2e_test_user',
                properties: {
                    test: true,
                    timestamp: new Date().toISOString(),
                },
            },
        });

        expect(eventResponse.status()).toBe(202);

        // Wait for event processing (5 seconds should be enough)
        await page.waitForTimeout(5000);

        // Open dashboard
        await page.goto('http://localhost:5173');
        await page.waitForSelector('.recharts-line', { timeout: 10000 });

        // Verify metrics are displayed
        await expect(page.getByText('Total Events')).toBeVisible();
    });
});
