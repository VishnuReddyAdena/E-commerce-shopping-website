import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Disable command buffering so queries fail fast rather than hanging when offline
    mongoose.set('bufferCommands', false);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 4000 // 4 seconds timeout
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    global.isDbConnected = true;
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    console.warn(`[Failover] Server proceeding in Sandbox Mode using local memory arrays.`);
    global.isDbConnected = false;
  }
};

export default connectDB;
