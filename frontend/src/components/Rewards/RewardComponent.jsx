import React, { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import earlybirdImg from "./earlybird.png";
import nightowlImg from "./nightowl.png";
import focuspearlImg from "./focuspearl.png";

const RewardComponent = ({ userId }) => {
  const [rewards, setRewards] = useState({ earlybird: 0, nightowl: 0, points: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return; // Ensure userId exists before fetching

    const fetchRewards = async () => {
      try {
        const db = getFirestore();
        const rewardsRef = collection(db, `users/${userId}/rewards`);
        const rewardsSnap = await getDocs(rewardsRef);

        let newRewards = { earlybird: 0, nightowl: 0, points: 0 };

        // Loop through all documents inside 'rewards' subcollection
        rewardsSnap.forEach((doc) => {
          if (doc.id === "earlybird") {
            newRewards.earlybird = doc.data().count || 0;
          } else if (doc.id === "nightowl") {
            newRewards.nightowl = doc.data().count || 0;
          } else if (doc.id === "points") {
            newRewards.points = doc.data().points || 0;
          }
        });

        console.log("Fetched Rewards:", newRewards); // Debugging
        setRewards(newRewards);
      } catch (error) {
        console.error("Error fetching rewards:", error);
      }
      setLoading(false);
    };

    fetchRewards();
  }, [userId]);

  const hasBadges = rewards.earlybird > 5 || rewards.nightowl > 5 || rewards.points > 40;

  return (
    <div>
      <h2 className="text-black" style={{fontFamily: '"Roboto", sans-serif', fontWeight: '600', fontSize:'20px'}}>Your Achievements</h2>
      {loading ? (
        <p>Loading...</p>
      ) : hasBadges ? (
        <div style={{ display: "flex", gap: "40px" }}>
          {rewards.earlybird > 5 && <img src={earlybirdImg} alt="Early Bird" width="160" title="You have earned the Early Bird reward!"  />}
          {rewards.nightowl > 5 && <img src={nightowlImg} alt="Night Owl" width="160" title="You have earned the Night Owl reward!"/>}
          {rewards.points > 40 && <img src={focuspearlImg} alt="Points" width="160" title="You have earned the Focus Pearl reward!"/>}
        </div>
      ) : (
        <p>No Badges Earned</p>
      )}
    </div>
  );
};

export default RewardComponent;
