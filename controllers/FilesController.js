import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import path from 'path';
import dbClient from '../utils/db.js';
import { ObjectId } from 'mongodb';
import UsersController from './UsersController.js';

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

class FilesController {
  static async postUpload(req, res) {
    const { name, type, parentId = 0, isPublic = false, data } = req.body;

    // Retrieve the user based on token
    const user = await UsersController.getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validation bs
    if (!name) return res.status(400).json({ error: 'Missing name' });
    if (!['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }
    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    // Check parentId if provided
    if (parentId) {
      const parentFile = await dbClient.db.collection('files').findOne({ _id: new ObjectId(parentId) });
      if (!parentFile) return res.status(400).json({ error: 'Parent not found' });
      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    const fileDocument = {
      userId: user._id,
      name,
      type,
      isPublic,
      parentId: parentId || 0,
    };

    if (type === 'folder') {
      const result = await dbClient.db.collection('files').insertOne(fileDocument);
      return res.status(201).json(result.ops[0]);
    } else {
      // Ensure folder path exists
      await fs.mkdir(FOLDER_PATH, { recursive: true });

      // Decode Base64 data and store it as a file
      const localPath = path.join(FOLDER_PATH, uuidv4());
      const buffer = Buffer.from(data, 'base64');
      await fs.writeFile(localPath, buffer);

      fileDocument.localPath = localPath;

      const result = await dbClient.db.collection('files').insertOne(fileDocument);
      return res.status(201).json(result.ops[0]);
    }
  }
}

export default FilesController;