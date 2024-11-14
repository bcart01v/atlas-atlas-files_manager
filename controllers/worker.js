import Bull from 'bull';
import dbClient from './utils/db.js';
import { ObjectId } from 'mongodb';
import imageThumbnail from 'image-thumbnail';
import fs from 'fs';
import path from 'path';

const fileQueue = new Bull('fileQueue');

fileQueue.process(async (job) => {
  const { fileId, userId } = job.data;

  if (!fileId) throw new Error('Missing fileId');
  if (!userId) throw new Error('Missing userId');

  // Retrieve the file from DB
  const file = await dbClient.db.collection('files').findOne({
    _id: new ObjectId(fileId),
    userId: new ObjectId(userId),
  });
  if (!file) throw new Error('File not found');

  if (file.type !== 'image' || !file.localPath) {
    throw new Error('Invalid file type or missing local path');
  }

  // Generate thumbnails and save them locally
  const sizes = [500, 250, 100];
  for (const width of sizes) {
    try {
      const options = { width };
      const thumbnail = await imageThumbnail(file.localPath, options);
      const thumbnailPath = `${file.localPath}_${width}`;
      await fs.promises.writeFile(thumbnailPath, thumbnail);
    } catch (err) {
      console.error(`Error generating thumbnail for size ${width}:`, err);
    }
  }
});

fileQueue.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

fileQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed: ${err.message}`);
});