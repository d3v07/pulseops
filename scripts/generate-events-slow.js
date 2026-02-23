#!/usr/bin/env node

/**
 * Generate synthetic events with rate limiting to avoid 429 errors
 */

const API_URL = process.env.API_URL || 'http://localhost:3001';
const API_KEY = process.env.API_KEY || 'demo_key_change_this';
const COUNT = parseInt(process.argv[2] || '500', 10);
const DELAY_MS = 50; // 50ms delay between requests = ~20 req/sec

const EVENT_TYPES = ['page_view', 'button_click', 'form_submit', 'purchase', 'signup'];
const PAGES = ['/home', '/pricing', '/features', '/docs', '/blog'];
const SEGMENTS = ['Pro', 'Team', 'Enterprise'];
const REGIONS = ['North America', 'Europe', 'APAC'];
const DEVICES = ['Web', 'Mobile', 'Desktop'];
const PRODUCTS = ['Core', 'Insights', 'Workflow'];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateEvent() {
    const event = {
        event_name: EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)],
        user_id: `user_${Math.floor(Math.random() * 1000)}`,
        properties: {
            page: PAGES[Math.floor(Math.random() * PAGES.length)],
            referrer: 'https://google.com',
            session_duration: Math.floor(Math.random() * 600),
            segment: SEGMENTS[Math.floor(Math.random() * SEGMENTS.length)],
            region: REGIONS[Math.floor(Math.random() * REGIONS.length)],
            device: DEVICES[Math.floor(Math.random() * DEVICES.length)],
            product: PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)],
        },
    };

    try {
        const response = await fetch(`${API_URL}/api/v1/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': API_KEY,
            },
            body: JSON.stringify(event),
        });

        if (response.ok) {
            return true;
        } else {
            console.error(`Failed: ${response.status} ${response.statusText}`);
            return false;
        }
    } catch (error) {
        console.error('Error:', error.message);
        return false;
    }
}

async function main() {
    console.log(`Generating ${COUNT} synthetic events with rate limiting...`);
    console.log(`Delay between requests: ${DELAY_MS}ms (~${Math.floor(1000 / DELAY_MS)} req/sec)`);

    let success = 0;
    let failed = 0;
    const startTime = Date.now();

    for (let i = 0; i < COUNT; i++) {
        const result = await generateEvent();
        if (result) {
            success++;
        } else {
            failed++;
        }

        // Add delay to avoid rate limiting
        if (i < COUNT - 1) {
            await sleep(DELAY_MS);
        }

        if ((i + 1) % 100 === 0) {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            const rate = ((i + 1) / elapsed).toFixed(1);
            console.log(`Progress: ${i + 1}/${COUNT} (${success} success, ${failed} failed) - ${rate} req/s`);
        }
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    const avgRate = (success / totalTime).toFixed(1);

    console.log(`\nComplete: ${success} events generated successfully in ${totalTime}s (${avgRate} req/s)`);
    if (failed > 0) {
        console.log(`Failed: ${failed} events`);
    }
}

main().catch(console.error);
