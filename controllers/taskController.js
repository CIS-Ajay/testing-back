const Task = require('../models/taskModel');

module.exports = {
    createTask: async (req, res) => {
        const { title, description, dueDate, priority, status } = req.body;
        const userId = req.user._id; 

        try {
            const newTask = new Task({ title, description, dueDate, priority, status, userId });
            console.log("newwwwtassskkk",newTask);
            
            await newTask.save();
            res.status(201).json(newTask);
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    getTasks: async (req, res) => {
        const userId = req.user._id;
        console.log(req.user)   
        try {
            const tasks = await Task.find({ userId });
            res.json(tasks);
        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    updateTask: async (req, res) => {
        const { id } = req.params;
        const { title, description, dueDate, priority, status } = req.body;
        const userId = req.user._id;

        try {
            const task = await Task.findOneAndUpdate(
                { _id: id, userId },
                { title, description, dueDate, priority, status },
                { new: true }
            );

            if (!task) {
                return res.status(404).json({ message: 'Task not found' });
            }

            res.json(task);
        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    deleteTask: async (req, res) => {
        const { id } = req.params;
        const userId = req.user._id; 

        try {
            const task = await Task.findOneAndDelete({ _id: id, userId });

            if (!task) {
                return res.status(404).json({ message: 'Task not found' });
            }

            res.json({ message: 'Task deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};