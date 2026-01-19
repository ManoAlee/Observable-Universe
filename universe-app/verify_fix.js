
// Mocking fetch for testing
global.fetch = async (url) => {
    if (url.includes('api.nasa.gov')) {
        return {
            ok: false,
            status: 429,
            json: async () => ({ error: 'Rate limit exceeded' })
        };
    }
    if (url.includes('swpc.noaa.gov')) {
        return {
            ok: true,
            json: async () => [] // Empty array test
        };
    }
    if (url.includes('earthquake.usgs.gov')) {
        return {
            ok: true,
            json: async () => ({ features: null }) // Null features test
        };
    }
};

const NASA_API_KEY = 'DEMO_KEY';

class UniverseDecoderService {
    static async getSolarActivity() {
        try {
            const response = await fetch('https://services.swpc.noaa.gov/json/planetary_k_index_1m.json');
            if (!response.ok) {
                console.warn(`[UniverseDecoder] Solar API returned status \${response.status}`);
                return 3;
            }
            const data = await response.json();
            if (!Array.isArray(data) || data.length === 0) return 3;
            const latest = data[data.length - 1];
            return parseFloat(latest.kp_index) || 3;
        } catch (error) {
            console.error('[UniverseDecoder] Solar fetch failed:', error);
            return 3;
        }
    }

    static async getEarthPulse() {
        try {
            const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_hour.geojson');
            if (!response.ok) {
                console.warn(`[UniverseDecoder] Earth API returned status \${response.status}`);
                return { mag: 0, place: 'Standby' };
            }
            const data = await response.json();
            const features = data?.features;

            if (features && Array.isArray(features) && features.length > 0) {
                const magnitudes = features.map((f) => f.properties.mag);
                const maxMag = Math.max(...magnitudes);
                const latestHigh = features.find((f) => f.properties.mag === maxMag);
                return { mag: maxMag, place: latestHigh?.properties?.place || 'Unknown' };
            }
            return { mag: 0, place: 'Quiet' };
        } catch (error) {
            console.error('[UniverseDecoder] Earth fetch failed:', error);
            return { mag: 0, place: 'Error' };
        }
    }

    static async getNEOData() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=\${today}&end_date=\${today}&api_key=\${NASA_API_KEY}`;
            const response = await fetch(url);

            if (!response.ok) {
                if (response.status === 429) {
                    console.warn('[UniverseDecoder] NASA NEO API rate limit reached (429). Using fallback values.');
                } else {
                    console.warn(`[UniverseDecoder] NASA NEO API returned status \${response.status}`);
                }
                return 20;
            }

            const data = await response.json();
            const nearObjects = data?.near_earth_objects?.[today];

            if (nearObjects && Array.isArray(nearObjects) && nearObjects.length > 0) {
                let minDistance = Infinity;
                nearObjects.forEach((obj) => {
                    const dist = parseFloat(obj?.close_approach_data?.[0]?.miss_distance?.lunar);
                    if (!isNaN(dist) && dist < minDistance) minDistance = dist;
                });
                return minDistance === Infinity ? 20 : minDistance;
            }
            return 20;
        } catch (error) {
            console.error('[UniverseDecoder] NEO fetch failed:', error);
            return 20;
        }
    }
}

async function runTests() {
    console.log('--- Testing Solar Activity (Empty Data) ---');
    console.log('Result:', await UniverseDecoderService.getSolarActivity());

    console.log('\n--- Testing Earth Pulse (Null Features) ---');
    console.log('Result:', await UniverseDecoderService.getEarthPulse());

    console.log('\n--- Testing NEO Data (429 Error) ---');
    console.log('Result:', await UniverseDecoderService.getNEOData());
}

runTests();
