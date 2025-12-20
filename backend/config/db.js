const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
  console.error(`Error: ${error.message}`);
  // throwing error lets Vercel restart automatically instead of crashing hard
  throw error; 
}
};

module.exports = connectDB;