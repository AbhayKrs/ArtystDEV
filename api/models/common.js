import mongoose from 'mongoose';

const commonSchema = new mongoose.Schema(
    {
        tags: [{
            type: String
        }],
        images: {
            login: String,
            signup: String
        },
        awards: [{
            icon: String,
            title: String
        }],
        avatars: [{
            icon: String,
            category: String
        }]
    }
);

const Common = mongoose.model('Common', commonSchema);
export default Common;
