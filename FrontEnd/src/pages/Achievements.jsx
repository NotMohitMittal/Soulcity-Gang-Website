import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Flame, Medal, CalendarDays } from "lucide-react";
import useAchievementsStore from "../store/useAchievementsStore";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const categoryIcons = {
  territory: Flame,
  milestone: Medal,
  default: Trophy,
};

const AchievementCard = ({ achievement }) => {
  const Icon = categoryIcons[achievement.category] ?? categoryIcons.default;

  return (
    <motion.div
      variants={item}
      whileHover={{ y: -4 }}
      className="bg-black/60 backdrop-blur-md border border-white/10 hover:border-[#de425b]/50 rounded-3xl p-6 flex flex-col gap-4 transition-colors"
    >
      <div className="w-11 h-11 rounded-2xl bg-[#de425b]/15 flex items-center justify-center">
        <Icon size={20} className="text-[#de425b]" />
      </div>
      <div>
        <h3 className="font-bold text-white">{achievement.title}</h3>
        <p className="text-sm text-gray-400 mt-1">{achievement.description}</p>
      </div>
      {achievement.date && (
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-auto">
          <CalendarDays size={14} />
          {achievement.date}
        </div>
      )}
    </motion.div>
  );
};

const Achievements = () => {
  const { achievements, loading, fetchAchievements } = useAchievementsStore();

  useEffect(() => {
    fetchAchievements();
  }, []);

  return (
    <div className="w-screen h-screen overflow-y-auto bg-black text-white relative">
      <div className="pointer-events-none absolute top-[10%] left-[-10%] w-[45vw] h-[45vw] bg-[#de425b]/10 rounded-full blur-[140px]" />

      <div className="relative px-6 md:px-16 pt-28 pb-16 max-w-7xl mx-auto">
        <p className="text-[#de425b] font-bold text-sm tracking-tight mb-2">// THE TROPHY CASE</p>
        <h1 className="text-4xl md:text-5xl font-extrabold leading-none">Achievements</h1>
        <p className="text-gray-400 mt-3 max-w-md mb-10">
          Territory won, milestones hit, and moments worth remembering.
        </p>

        {achievements.length === 0 && !loading ? (
          <div className="border border-dashed border-white/15 rounded-3xl py-20 flex flex-col items-center justify-center text-center gap-3">
            <Trophy size={28} className="text-gray-600" />
            <p className="text-gray-400 max-w-sm">
              No achievements logged yet. Once the achievements endpoint is connected, the gang's wins will show up here.
            </p>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {achievements.map((achievement) => (
              <AchievementCard key={achievement._id} achievement={achievement} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Achievements;