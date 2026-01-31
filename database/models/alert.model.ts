import { Schema, model, models, type Document, type Model } from 'mongoose';

export interface AlertItem extends Document {
    userId: string;
    symbol: string;
    company: string;
    alertName: string;
    alertType: 'upper' | 'lower';
    threshold: number;
    frequency: 'once_per_day' | 'once_per_hour' | 'once_per_minute';
    createdAt: Date;
}

const AlertSchema = new Schema<AlertItem>(
    {
        userId: { type: String, required: true, index: true },
        symbol: { type: String, required: true, uppercase: true, trim: true },
        company: { type: String, required: true, trim: true },
        alertName: { type: String, required: true, trim: true },
        alertType: { type: String, enum: ['upper', 'lower'], required: true },
        threshold: { type: Number, required: true },
        frequency: {
            type: String,
            enum: ['once_per_day', 'once_per_hour', 'once_per_minute'],
            default: 'once_per_day'
        },
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: false }
);

// Index for efficient querying
AlertSchema.index({ userId: 1, symbol: 1 });

export const Alert: Model<AlertItem> =
    (models?.Alert as Model<AlertItem>) || model<AlertItem>('Alert', AlertSchema);
