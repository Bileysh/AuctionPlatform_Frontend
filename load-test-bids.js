import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

const successBids = new Counter('successful_bids');
const lockedBids  = new Counter('locked_bids');
const rateLimited = new Counter('rate_limited');
const ruleBids    = new Counter('business_rule_bids');

export const options = {
    scenarios: {
        bidding_spike: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '5s', target: 100 },
                { duration: '10s', target: 100 }, 
                { duration: '5s', target: 0 },   
            ],
        },
    },
};

const API_URL = __ENV.API_URL || 'http://localhost:5130/api';
const AUCTION_ID = __ENV.AUCTION_ID || '4a321ce8-05d0-4782-8383-b99b9ea45d85';
const TOKEN = __ENV.TOKEN || 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Im9ocW42WkV1b3FNNWVNdEJ1WkhOcyJ9.eyJodHRwczovL2F1Y3Rpb24tYXBpLmNvbS91c2VybmFtZSI6InVzZXIiLCJodHRwczovL2F1Y3Rpb24tYXBpLmNvbS9yb2xlcyI6W10sImlzcyI6Imh0dHBzOi8vZGV2LTNuYTA0Y3B5ZWRjbnpiZmIudXMuYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDZhMmQyOGQ0MjNhOGY2ZGY2YTllNGZhYyIsImF1ZCI6WyJodHRwczovL2F1Y3Rpb24tYXBpLmNvbSIsImh0dHBzOi8vZGV2LTNuYTA0Y3B5ZWRjbnpiZmIudXMuYXV0aDAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTc4NTY5ODY3NSwiZXhwIjoxNzg1Nzg1MDc1LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIiwiYXpwIjoiUTFKZjVrUEo0TXBBd3ZmQlBkeTNEOFZJRU1GZzRPUnoifQ.HHskCLsERtl5r0YzFBVW5L43VwkagKjIAwuhP_v--lZ1ZM9vQ06Pc-Oq0oPdRpr9sZTEbx2_A8rokZ4aMhxLe91ceyhc8kV8w4_S5tJ5Sk0SnKp9DThCxxUDmDLnKF1s68WIgNFpTTusCvT3BrArbzYpD4m7i1MAra4mWZFzCcjvLeggI0INGaTcCCVGAjWqIb5D4sOEUHzxVUJ4UrhCEwYdlIHlTIapkw02ERj3bo6g8yfrLWs731NQhrLS_tDR_qkuwQ6Q45dBliVxZBVr_2b-2XPkZoQe81_nDgo0FXb231aJBKkqIrqGBDiiEiz2FaplauThgL1jj3EZBR8xDA';

export default function () {
    
    const url = `${API_URL}/Auctions/${AUCTION_ID}/bid`;

    const bidAmount = Math.floor(Math.random() * 500) + 1000;

    const payload = JSON.stringify({
        amount: bidAmount
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TOKEN}`,
        },
        responseCallback: http.expectedStatuses(200, 409, 422, 429),
    };

    const res = http.post(url, payload, params);
    check(res, {
    'response is expected': (r) => [200, 409, 422, 429].includes(r.status),
    });
     if (![200, 409, 422, 429].includes(res.status)) {
    console.log(`Unexpected ${res.status}: ${res.body}`);
    }  
    
    if (res.status === 200) successBids.add(1);
if (res.status === 409) lockedBids.add(1);
if (res.status === 422) ruleBids.add(1);
if (res.status === 429) rateLimited.add(1);
    sleep(0.1);
}