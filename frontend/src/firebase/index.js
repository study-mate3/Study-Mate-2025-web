const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// Schedule function to run every Sunday at 00:00 Sri Lanka time
exports.resetWeeklyRewards = functions.pubsub
  .schedule("0 0 * * 0")
  .timeZone("Asia/Colombo")
  .onRun(async (context) => {
    const usersRef = admin.firestore().collection("users");

    try {
      const usersSnapshot = await usersRef.get();

      // Loop through each user
      usersSnapshot.forEach(async (userDoc) => {
        const rewardsRef = usersRef.doc(userDoc.id).collection("rewards");

        // Reset 'count' field for earlybird and nightowl documents
        const earlybirdRef = rewardsRef.doc("earlybird");
        const nightowlRef = rewardsRef.doc("nightowl");

        try {
          await earlybirdRef.update({ count: 0 });
          await nightowlRef.update({ count: 0 });

          console.log(`Weekly reset done for ${userDoc.id}`);
        } catch (error) {
          console.error(`Error resetting rewards for user ${userDoc.id}:`, error);
        }
      });

      console.log("Weekly reset completed for all users!");
    } catch (error) {
      console.error("Failed to reset weekly rewards:", error);
    }

    return null;
  });
