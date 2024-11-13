import dbClient from '../utils/db.js';
import redisClient from '../utils/redis.js';
import crypto from 'crypto';
import { ObjectId } from 'mongodb';

class UsersController {
    // Create and store new user
    static async postNew(req, res) {
        try {
            const { email, password } = req.body;

            // Validate email and password
            if (!email) {
                return res.status(400).json({ error: 'Email is required' });
            }
            if (!password) {
                return res.status(400).json({ error: 'Password is required' });
            }

            // Check if the email already exists
            const existingUser = await dbClient.db.collection('users').findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: 'Account already exists' });
            }

            const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');
            const result = await dbClient.db.collection('users').insertOne({ email, password: hashedPassword });

            return res.status(201).json({ id: result.insertedId, email });
        } catch (err) {
            console.error('Error creating user:', err);
            return res.status(500).json({ error: 'Error while creating user' });
        }
    }

    // Get the current user based on the token
    static async getMe(req, res) {
        const token = req.headers['x-token'];

        // Validate token
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized.' });
        }

        try {
            const key = `auth_${token}`;
            const userId = await redisClient.get(key);

            if (!userId) {
                return res.status(401).json({ error: 'Invalid token, please try again.' });
            }

            // Find the user by ID
            const user = await dbClient.db.collection('users').findOne({ _id: new ObjectId(userId) });
            if (!user) {
                return res.status(401).json({ error: 'Unauthorized: User Not Found.' });
            }

            return res.status(200).json({ id: user._id, email: user.email });
        } catch (err) {
            console.error('Error retrieving user:', err);
            return res.status(500).json({ error: 'An unexpected error occurred.' });
        }
    }

    // Retrieve the user based on token (for FilesController use)
    static async getUserFromToken(req) {
        const token = req.headers['x-token'];
        if (!token) return null;

        try {
            const userId = await redisClient.get(`auth_${token}`);
            if (!userId) return null;

            const user = await dbClient.db.collection('users').findOne({ _id: new ObjectId(userId) });
            return user;
        } catch (err) {
            console.error('Error retrieving user from token:', err);
            return null;
        }
    }
}

export default UsersController;