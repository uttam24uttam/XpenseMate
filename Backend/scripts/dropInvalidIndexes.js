import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/Expense_tracker";

async function dropInvalidIndexes() {
    try {
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('friendtransactions');

        // Get all indexes
        const indexes = await collection.indexes();
        console.log('\n📋 Current indexes:');
        indexes.forEach(idx => console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}`));

        // Drop the problematic compound index on two arrays
        try {
            await collection.dropIndex('paidBy.user_1_payees.user_1');
            console.log('\n✅ Dropped problematic index: paidBy.user_1_payees.user_1');
        } catch (err) {
            if (err.codeName === 'IndexNotFound') {
                console.log('\n⚠️  Index not found (might already be dropped)');
            } else {
                throw err;
            }
        }

        console.log('\n✅ Index cleanup completed!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

console.log('🚀 Dropping invalid indexes...\n');
dropInvalidIndexes();
