import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.js';
import Transaction from '../models/transaction.js';
import FriendBalance from '../models/FriendBalance.js';

dotenv.config();

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/Expense_tracker";

async function migrateData() {
    try {
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Step 1: Migrate User friends array to FriendBalance collection (with balance=0)
        console.log('\n📋 Step 1: Migrating User friends to FriendBalance collection...');
        const users = await User.find({});
        let friendshipCount = 0;

        for (const user of users) {
            if (user.friends && Array.isArray(user.friends) && user.friends.length > 0) {
                for (const friendId of user.friends) {
                    // Ensure user1 < user2 to avoid duplicates
                    const [user1, user2] = [user._id.toString(), friendId.toString()].sort();

                    // Check if friendship already exists in FriendBalance
                    const existing = await FriendBalance.findOne({ user1, user2 });
                    if (!existing) {
                        await FriendBalance.create({
                            user1,
                            user2,
                            balance: 0, // Initialize with zero balance
                            status: 'active'
                        });
                        friendshipCount++;
                        console.log(`   Created friendship: ${user1} ↔ ${user2}`);
                    } else {
                        // If exists but no status field, add it
                        if (!existing.status) {
                            existing.status = 'active';
                            await existing.save();
                        }
                    }
                }
            }
        }
        console.log(`✅ Created/updated ${friendshipCount} friendships`);

        // Step 2: Migrate Transaction userid (String) to userId (ObjectId)
        console.log('\n📋 Step 2: Migrating Transaction.userid to Transaction.userId...');
        const transactions = await mongoose.connection.db.collection('transactions').find({}).toArray();
        let transactionCount = 0;

        for (const txn of transactions) {
            if (txn.userid && typeof txn.userid === 'string') {
                // Check if userid is a valid ObjectId string
                if (mongoose.Types.ObjectId.isValid(txn.userid)) {
                    await mongoose.connection.db.collection('transactions').updateOne(
                        { _id: txn._id },
                        {
                            $set: {
                                userId: new mongoose.Types.ObjectId(txn.userid),
                                status: 'active'
                            },
                            $unset: { userid: "" }
                        }
                    );
                    transactionCount++;
                    if (transactionCount % 10 === 0) {
                        console.log(`   Migrated ${transactionCount} transactions...`);
                    }
                }
            }
        }
        console.log(`✅ Migrated ${transactionCount} transactions`);

        // Step 3: Add status field to existing FriendBalance records
        console.log('\n📋 Step 3: Adding status fields to existing records...');

        const friendBalanceUpdate = await mongoose.connection.db.collection('friendbalances').updateMany(
            { status: { $exists: false } },
            { $set: { status: 'active' } }
        );
        console.log(`✅ Updated ${friendBalanceUpdate.modifiedCount} friend balance records`);

        const friendTxnUpdate = await mongoose.connection.db.collection('friendtransactions').updateMany(
            { status: { $exists: false } },
            { $set: { status: 'active' } }
        );
        console.log(`✅ Updated ${friendTxnUpdate.modifiedCount} friend transactions`);

        // Step 4: Remove friends array from User documents (optional - for cleanup)
        console.log('\n📋 Step 4: Cleaning up User.friends array...');
        const userUpdate = await User.updateMany(
            { friends: { $exists: true } },
            { $unset: { friends: "" } }
        );
        console.log(`✅ Cleaned up ${userUpdate.modifiedCount} user documents`);

        console.log('\n✅ Migration completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - ${friendshipCount} friendships created/updated in FriendBalance`);
        console.log(`   - ${transactionCount} transactions migrated`);
        console.log(`   - ${friendBalanceUpdate.modifiedCount} friend balance records updated`);
        console.log(`   - ${friendTxnUpdate.modifiedCount} friend transactions updated`);
        console.log(`   - ${userUpdate.modifiedCount} users cleaned up`);

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

// Run migration
console.log('🚀 Starting database schema migration...');
console.log('⚠️  Make sure you have a backup of your database before proceeding!\n');

migrateData();
