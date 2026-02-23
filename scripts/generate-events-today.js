#!/usr/bin/env node

/**
 * Generate synthetic events for TODAY (not tomorrow) using batch endpoint
 */

const API_URL = process.env.API_URL || 'http://localhost:3001';
const API_KEY = process.env.API_KEY || 'demo_key_change_this';
const TOTAL_EVENTS = parseInt(process.argv[2] || '2000', 10);
const BATCH_SIZE = 100;
const DELAY_MS = 700;

const EVENT_TYPES = ['page_view', 'button_click', 'form_submit', 'purchase', 'signup'];
const PAGES = ['/home', '/pricing', '/features', '/docs', '/blog', '/contact', '/about'];
const SEGMENTS = ['Pro', 'Team', 'Enterprise'];
const REGIONS = ['North America', 'Europe', 'APAC'];
const DEVICES = ['Web', 'Mobile', 'Desktop'];
const PRODUCTS = ['Core', 'Insights', 'Workflow'];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function generateBatch(size) {
    const events = [];
    // Use current date/time for realistic data
    const now = new Date();

    for (let i = 0; i < size; i++) {
        // Generate events from the last 24 hours
        const eventTime = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000);

        events.push({
            event_name: EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)],
            user_id: `user_${Math.floor(Math.random() * 1000)}`,
            timestamp: eventTime.toISOString(),
            properties: {
                page: PAGES[Math.floor(Math.random() * PAGES.length)],
                referrer: Math.random() > 0.5 ? 'https://google.com' : 'https://twitter.com',
                session_duration: Math.floor(Math.random() * 600),
                segment: SEGMENTS[Math.floor(Math.random() * SEGMENTS.length)],
                region: REGIONS[Math.floor(Math.random() * REGIONS.length)],
                device: DEVICES[Math.floor(Math.random() * DEVICES.length)],
                product: PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)],
            },
        });
    }
    return events;
}

async function sendBatch(events) {
    try {
        const response = await fetch(`${API_URL}/api/v1/events/batch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': API_KEY,
            },
            body: JSON.stringify({ events }),
        });

        if (response.ok) {
            const data = await response.json();
            return { success: true, count: data.count || events.length };
        } else {
            const text = await response.text();
            console.error(`Failed: ${response.status} ${response.statusText} - ${text}`);
            return { success: false, count: 0 };
        }
    } catch (error) {
        console.error('Error:', error.message);
        return { success: false, count: 0 };
    }
}

async function main() {
    console.log(`Generating ${TOTAL_EVENTS} events with timestamps from the last 24 hours...`);
    console.log(`Current time: ${new Date().toISOString()}`);

    const numBatches = Math.ceil(TOTAL_EVENTS / BATCH_SIZE);
    let totalSuccess = 0;
    let totalFailed = 0;
    const startTime = Date.now();

    for (let batchNum = 0; batchNum < numBatches; batchNum++) {
        const remainingEvents = TOTAL_EVENTS - (batchNum * BATCH_SIZE);
        const batchSize = Math.min(BATCH_SIZE, remainingEvents);

        const batch = generateBatch(batchSize);
        const result = await sendBatch(batch);

        if (result.success) {
            totalSuccess += result.count;
            process.stdout.write('.');
        } else {
            totalFailed += batchSize;
            process.stdout.write('x');
        }

        if ((batchNum + 1) % 10 === 0 || batchNum === numBatches - 1) {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            const rate = (totalSuccess / elapsed).toFixed(1);
            console.log(` Batch ${batchNum + 1}/${numBatches} - ${totalSuccess} events (${rate} events/s)`);
        }

        if (batchNum < numBatches - 1) {
            await sleep(DELAY_MS);
        }
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    const avgRate = (totalSuccess / totalTime).toFixed(1);

    console.log(`\n✅ Complete: ${totalSuccess} events in ${totalTime}s (${avgRate} events/s)`);
    if (totalFailed > 0) {
        console.log(`❌ Failed: ${totalFailed} events`);
    }
}

main().catch(console.error);
