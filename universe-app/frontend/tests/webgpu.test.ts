import { test, expect } from '@playwright/test';

test('WebGPU canvas falls back to 2D when WebGPU is not supported', async ({ page }) => {
    // WebGPU is usually not enabled by default in Playwright's default chromium profile without flags
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Verify that even without WebGPU, the canvas is rendered (fallback logic)
    // We can check if the canvas has a 2d context or simply that it exists and hasn't crashed
    const hasGPU = await page.evaluate(() => 'gpu' in navigator);
    console.log(`Browser has WebGPU support: ${hasGPU}`);

    // If no GPU, the fallback should have filled the canvas
    if (!hasGPU) {
        const isFilled = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            if (!canvas) return false;
            const ctx = canvas.getContext('2d');
            if (!ctx) return false;
            const data = ctx.getImageData(0, 0, 1, 1).data;
            return data[3] > 0; // Check if alpha > 0 (pixels were drawn)
        });
        expect(isFilled).toBe(true);
    }
});
