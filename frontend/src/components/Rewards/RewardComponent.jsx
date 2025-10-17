import React, { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import earlybirdImg from "./earlybird.png";
import nightowlImg from "./nightowl.png";
import focuspearlImg from "./focuspearl.png";

const RewardComponent = ({ userId }) => {
  const [rewards, setRewards] = useState({ earlybird: 0, nightowl: 0, points: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const db = getFirestore();
        const rewardsRef = collection(db, `users/${userId}/rewards`);
        const snap = await getDocs(rewardsRef);
        const next = { earlybird: 0, nightowl: 0, points: 0 };
        snap.forEach((doc) => {
          if (doc.id === "earlybird") next.earlybird = doc.data().count || 0;
          if (doc.id === "nightowl")  next.nightowl  = doc.data().count || 0;
          if (doc.id === "points")    next.points    = doc.data().points || 0;
        });
        setRewards(next);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const items = [
    rewards.earlybird > 5 && { key: "earlybird", src: earlybirdImg, label: "Early Bird" },
    rewards.nightowl  > 5 && { key: "nightowl",  src: nightowlImg,  label: "Night Owl" },
    rewards.points    > 40 && { key: "focus",    src: focuspearlImg,label: "Focus Pearl" },
  ].filter(Boolean);

  return (
    <div>
      <h2 className="text-black font-semibold text-xl">Your Achievements</h2>

      {loading ? (
        <p className="mt-2 text-sm text-gray-500">Loading...</p>
      ) : items.length ? (
        <div className="
          mt-4
          flex flex-col items-center space-y-6
          md:flex-row md:items-start md:space-y-0 md:space-x-10
        ">
          {items.map((b) => (
            <div
              key={b.key}
              className="flex flex-col items-center rounded-xl border border-gray-200/70 bg-white shadow-sm p-4 w-full max-w-[220px] md:max-w-none"
              title={b.label}
            >
              <img
                src={b.src}
                alt={b.label}
                className="w-28 h-auto md:w-36"
              />
              <span className="mt-2 text-gray-800 font-semibold text-sm md:text-base text-center">
                {b.label}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-gray-500">No Badges Earned</p>
      )}
    </div>
  );
};

export default RewardComponent;
