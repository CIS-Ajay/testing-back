const mongoose = require('mongoose');

const Role = mongoose.model(
    "Role",
    new mongoose.Schema({
        name: { type: String, required: true, unique: true },
        description: String,
        permissions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Permission"
            }
        ],
        // permissions: { type: [String], default: [] },
        // roles: { type: [String], default: ['user'] },
        // permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }]
    })
);

