// routes/index.js
// Added Documentation for easier readability
import express from 'express';
import AppController from '../controllers/AppController.js';
import UsersController from '../controllers/UsersController.js';
import AuthController from '../controllers/AuthController.js';
import FilesController from '../controllers/FilesController.js';

const router = express.Router();

// Status and statistics
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// User routes
router.post('/users', UsersController.postNew);
router.get('/users/me', UsersController.getMe);

// Authentication routes
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);

// Files routes
router.post('/files', FilesController.postUpload);
router.get('/files/:id', FilesController.getShow);
router.get('/files', FilesController.getIndex);

// Publishing and unpublishing files
router.put('/files/:id/publish', FilesController.putPublish);
router.put('/files/:id/unpblish', FilesController.putUnpublish);

// Endpoint to get file content
router.get('/files/:id/data', FilesController.getFile);

export default router;