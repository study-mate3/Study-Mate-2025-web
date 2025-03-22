const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

// Runs every Monday at 00:00 (midnight) UTC
exports.resetWeeklyRewards = functions.pubsub.schedule("every monday 00:00")
    .timeZone("Asia/Colombo") // Set your timezone
    .onRun(async (context) => {
        try {
            const usersSnapshot = await db.collection("users").get();

            const batch = db.batch();

            usersSnapshot.forEach(userDoc => {
                const rewardsRef = db.collection("users").doc(userDoc.id).collection("rewards");

                // Reset earlybird, nightowl, and points for each user
                batch.update(rewardsRef.doc("points"), { points: 0 });
                batch.update(rewardsRef.doc("earlybird"), { earlybird: 0 });
                batch.update(rewardsRef.doc("nightowl"), { nightowl: 0 });
            });

            await batch.commit();
            console.log("Weekly rewards reset successfully.");
        } catch (error) {
            console.error("Error resetting weekly rewards:", error);
        }
    });
