const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authenticateToken = require('../middleware/authenticateToken');

router.post('/create', authenticateToken, taskController.createTask);
router.get('/list', authenticateToken, taskController.getTasks);
router.put('/update/:id', authenticateToken, taskController.updateTask);
router.delete('/delete/:id', authenticateToken, taskController.deleteTask);

module.exports = router;
