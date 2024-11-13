// server.js
import express from 'express';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import dbClient from './utils/db.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use('/', routes);

app.listen(port, async () => {
    console.log(`Server running on port ${port}`);
    
    // Wait for the database to connect, then get stats
    try {
        await dbClient.client.connect();  // Ensure database is connected
        const userCount = await dbClient.nbUsers();
        const fileCount = await dbClient.nbFiles();

        console.log(`Current Users Count: ${userCount}`);
        console.log(`Current Files Count: ${fileCount}`);
    } catch (err) {
        console.error('Error fetching stats:', err);
    }
});
