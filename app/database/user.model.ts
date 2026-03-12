import { Schema, model, models, Document } from 'mongoose';

// TypeScript interface for Event document
export interface IUser extends Document {
    name: string;
    email: string;
    phone: string;
    createdAt: Date;
    updatedAt: Date;
}

const EventSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            trim: true,
            lowercase: true,
            maxlength: [500, 'Email cannot exceed 500 characters'],
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
            maxlength: [20, 'Phone number cannot exceed 20 characters'],
        }
    },
    {
        timestamps: true, // Auto-generate createdAt and updatedAt
    }
);

// Create unique index on slug for better performance
EventSchema.index({ email: 1 });

// Create compound index for common queries
EventSchema.index({ name: 1, email: 1 });

const User = models.User || model<IUser>('User', EventSchema);

export default User;