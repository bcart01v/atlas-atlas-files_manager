// utils/redis.js
import { createClient } from 'redis';

class RedisClient {
    constructor() {
        this.client = createClient();

        this.client.on('error', (err) => {
            console.error('Redis client not connected to the server:', err);
        });

        this.client.on('connect', () => {
            console.log('Redis client connected to the server');
        });
    }

    isAlive() {
        return this.client.connected;
    }

    async get(key) {
        return new Promise((resolve, reject) => {
            this.client.get(key, (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
    }

    async set(key, value, duration) {
        return new Promise((resolve, reject) => {
            this.client.set(key, value, 'EX', duration, (err) => {
                if (err) reject(err);
                resolve(true);
            });
        });
    }

    async del(key) {
        return new Promise((resolve, reject) => {
            this.client.del(key, (err) => {
                if (err) reject(err);
                resolve(true);
            });
        });
    }
}

// This is the export class for RedisClient
const redisClient = new RedisClient();
export default redisClient;