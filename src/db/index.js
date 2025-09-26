import mongoose from "mongoose";

const connectDB = async function() {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('✅ Database connection successful.......')
    } catch (error) {
        console.log('❌ Something went wrong while connecting to database .....')
        throw error
    }

}

export default connectDB