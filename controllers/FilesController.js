import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import path from 'path';
import dbClient from '../utils/db.js';
import { ObjectId } from 'mongodb';
import UsersController from './UsersController.js';

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

class FilesController {
  // POST /files - Upload new file or create folder
  static async postUpload(req, res) {
    const { name, type, parentId = 0, isPublic = false, data } = req.body;

    // Retrieve the user based on token
    const user = await UsersController.getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validation checks
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

  // GET /files/:id - Retrieve file by ID
  static async getShow(req, res) {
    const user = await UsersController.getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const fileId = req.params.id;
    try {
      const file = await dbClient.db.collection('files').findOne({ _id: new ObjectId(fileId), userId: user._id });
      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }
      return res.status(200).json(file);
    } catch (err) {
      console.error('Error retrieving file:', err);
      return res.status(500).json({ error: 'Error retrieving file' });
    }
  }

  // GET /files - Retrieve files with pagination
  static async getIndex(req, res) {
    const user = await UsersController.getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const parentId = req.query.parentId || '0';
    const page = parseInt(req.query.page, 10) || 0;
    const pageSize = 20;

    try {
      const matchQuery = {
        userId: user._id,
        parentId: parentId
      };

      const files = await dbClient.db.collection('files')
        .aggregate([
          { $match: matchQuery },
          { $skip: page * pageSize },
          { $limit: pageSize }
        ])
        .toArray();

      return res.status(200).json(files);
    } catch (err) {
      console.error('Error retrieving files:', err);
      return res.status(500).json({ error: 'Error retrieving files' });
    }
  }

  // PUT /files/:id/publish - Set isPublic to true
  static async putPublish(req, res) {
    const user = await UsersController.getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const fileId = req.params.id;
    try {
      const file = await dbClient.db.collection('files').findOne({ _id: new ObjectId(fileId), userId: user._id });
      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      const result = await dbClient.db.collection('files').findOneAndUpdate(
        { _id: new ObjectId(fileId) },
        { $set: { isPublic: true } },
        { returnDocument: 'after' }
      );

      return res.status(200).json(result.value);
    } catch (err) {
      console.error('Error publishing file:', err);
      return res.status(500).json({ error: 'Error publishing file' });
    }
  }

  // PUT /files/:id/unpublish - Set isPublic to false
  static async putUnpublish(req, res) {
    const user = await UsersController.getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const fileId = req.params.id;
    try {
      const file = await dbClient.db.collection('files').findOne({ _id: new ObjectId(fileId), userId: user._id });
      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      const result = await dbClient.db.collection('files').findOneAndUpdate(
        { _id: new ObjectId(fileId) },
        { $set: { isPublic: false } },
        { returnDocument: 'after' }
      );

      return res.status(200).json(result.value);
    } catch (err) {
      console.error('Error unpublishing file:', err);
      return res.status(500).json({ error: 'Error unpublishing file' });
    }
  }
}

export default FilesController;