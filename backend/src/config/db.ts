import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
    const uri = process.env.MONGODB_URI!;
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected successfully');
};

export default connectDB;
