import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis.js';
import dbClient from '../utils/db.js';

class AuthController {
    static async getConnect(req, res) {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Basic ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const base64Credentials = authHeader.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [email, password] = credentials.split(':');

        const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');

        try {
            const user = await dbClient.db.collection('users').findOne({ email, password: hashedPassword });
            if (!user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const token = uuidv4();
            const key = `auth_${token}`;
            await redisClient.set(key, user._id.toString(), 24 * 60 * 60);

            return res.status(200).json({ token });
        } catch (error) {
            console.error('Error during authentication:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async getDisconnect(req, res) {
        const token = req.headers['x-token'];
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        try {
            const key = `auth_${token}`;
            const userId = await redisClient.get(key);
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            await redisClient.del(key);
            return res.status(204).send();
        } catch (error) {
            console.error('Disconnect Error:', error);
            return res.status(500).json({ error: 'An unexpected error occurred.' });
        }
    }
}

export default AuthController;
