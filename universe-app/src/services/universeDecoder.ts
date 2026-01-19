export interface LSSIData {
    lssi: number;
    solarKp: number;
    earthMag: number;
    neoDist: number;
    status: string;
    lastUpdate: string;
}

const NASA_API_KEY = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY';

export class UniverseDecoderService {
    private static cachedNeo: number | null = null;
    private static lastNeoFetch: number = 0;
    private static CACHE_DURATION = 1000 * 60 * 60; // 1 hour

    static async getSolarActivity(): Promise<number> {
        try {
            const response = await fetch('https://services.swpc.noaa.gov/json/planetary_k_index_1m.json');
            if (!response.ok) {
                // Silently fallback without warning for 429/500 to keep console clean in production
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

    static async getEarthPulse(): Promise<{ mag: number; place: string }> {
        try {
            const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_hour.geojson');
            if (!response.ok) {
                return { mag: 0, place: 'Standby' };
            }
            const data = await response.json();
            const features = data?.features;

            if (features && Array.isArray(features) && features.length > 0) {
                const magnitudes = features.map((f: any) => f.properties.mag);
                const maxMag = Math.max(...magnitudes);
                const latestHigh = features.find((f: any) => f.properties.mag === maxMag);
                return { mag: maxMag, place: latestHigh?.properties?.place || 'Unknown' };
            }
            return { mag: 0, place: 'Quiet' };
        } catch (error) {
            console.error('[UniverseDecoder] Earth fetch failed:', error);
            return { mag: 0, place: 'Error' };
        }
    }

    private static get isRateLimited(): boolean {
        try {
            if (typeof localStorage === 'undefined') return false;
            const item = localStorage.getItem('nasa_rate_limited');
            if (!item) return false;
            const limitTime = parseInt(item);
            if (Date.now() - limitTime > 1000 * 60 * 60) {
                localStorage.removeItem('nasa_rate_limited');
                return false;
            }
            return true;
        } catch (e) { return false; }
    }

    private static setRateLimited() {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('nasa_rate_limited', Date.now().toString());
            }
        } catch (e) { }
    }

    static async getNEOData(): Promise<number> {
        if (this.isRateLimited) {
            return this.getSimulatedNEOData();
        }

        try {
            const today = new Date().toISOString().split('T')[0];
            const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${NASA_API_KEY}`;

            const response = await fetch(url);
            this.lastNeoFetch = Date.now();

            if (!response.ok) {
                if (response.status === 429) {
                    this.setRateLimited();
                    console.info('[UniverseDecoder] NASA 429 Detectado. Ativando Modo de Simulação Determinística (60min).');
                    return this.getSimulatedNEOData();
                }
                return 20;
            }

            if (typeof localStorage !== 'undefined') localStorage.removeItem('nasa_rate_limited'); // Reset if successful

            const data = await response.json();
            const nearObjects = data?.near_earth_objects?.[today];

            if (nearObjects && Array.isArray(nearObjects) && nearObjects.length > 0) {
                let minDistance = Infinity;
                nearObjects.forEach((obj: any) => {
                    const dist = parseFloat(obj?.close_approach_data?.[0]?.miss_distance?.lunar);
                    if (!isNaN(dist) && dist < minDistance) minDistance = dist;
                });

                this.cachedNeo = minDistance === Infinity ? 20 : minDistance;
                return this.cachedNeo;
            }
            return 20;
        } catch (error) {
            this.setRateLimited();
            return this.getSimulatedNEOData();
        }
    }

    private static getSimulatedNEOData(): number {
        const today = new Date().toISOString().split('T')[0];
        const seed = parseInt(today.replace(/-/g, '')) || 0;
        // Deterministic noise based on date
        const noise = ((seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
        this.cachedNeo = 8 + noise * 15; // Stable range 8-23 Lunar Distances
        return this.cachedNeo;
    }

    static calculateLSSI(solar: number, earth: number, neo: number): number {
        const scoreSolar = (solar / 9) * 40;
        const scoreEarth = (earth / 10) * 40;
        const safeDist = Math.max(neo, 0.1);
        let scoreNeo = (1 / safeDist) * 20;
        if (scoreNeo > 20) scoreNeo = 20;

        return +(scoreSolar + scoreEarth + scoreNeo).toFixed(2);
    }

    static getStatus(lssi: number): string {
        if (lssi < 20) return 'O Universo local está calmo.';
        if (lssi < 50) return 'Atividade Moderada. Padrões detectados.';
        return 'ALERTA. Anomalias significativas detectadas.';
    }

    static async fetchFullStatus(): Promise<LSSIData> {
        if (this.isRateLimited) {
            const solar = 3.5;
            const earth = { mag: 1.2, place: 'Gaia_Simulated' };
            const neo = this.getSimulatedNEOData();
            const lssi = this.calculateLSSI(solar, earth.mag, neo);
            return {
                lssi,
                solarKp: solar,
                earthMag: earth.mag,
                neoDist: neo,
                status: this.getStatus(lssi) + ' (MODE: SIMULATION)',
                lastUpdate: new Date().toLocaleTimeString() + ' (FIXED)'
            };
        }

        const [solar, earthObj, neo] = await Promise.all([
            this.getSolarActivity(),
            this.getEarthPulse(),
            this.getNEOData()
        ]);

        const lssi = this.calculateLSSI(solar, earthObj.mag, neo);

        return {
            lssi,
            solarKp: solar,
            earthMag: earthObj.mag,
            neoDist: neo,
            status: this.getStatus(lssi),
            lastUpdate: new Date().toLocaleTimeString()
        };
    }
}
