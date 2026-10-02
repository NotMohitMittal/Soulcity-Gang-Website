import React from "react";
import { motion } from "framer-motion";
import { Flame, Users, MapPinned, Handshake } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

// Swap these for the real numbers whenever you have them
const values = [
  {
    icon: Flame,
    title: "Loyalty first",
    text: "We move as one crew. What happens inside the gang stays inside the gang.",
  },
  {
    icon: Users,
    title: "Every member matters",
    text: "From new recruits to founding members, everyone has a stake in what we build.",
  },
  {
    icon: MapPinned,
    title: "Territory is earned",
    text: "What we hold, we hold because we showed up for it — not because it was handed to us.",
  },
  {
    icon: Handshake,
    title: "Respect the deal",
    text: "Our word is worth something. Allies and rivals both know where they stand with us.",
  },
];

const About = () => {
  return (
    <div className="w-screen h-screen overflow-y-auto bg-black text-white relative">
      <div className="pointer-events-none absolute top-[-5%] right-[-10%] w-[50vw] h-[50vw] bg-[#de425b]/10 rounded-full blur-[140px]" />

      <div className="relative px-6 md:px-16 pt-28 pb-20 max-w-4xl mx-auto">
        <p className="text-[#de425b] font-bold text-sm tracking-tight mb-2">// WHO WE ARE</p>
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
          Red Network Soulcity
        </h1>
        <p className="text-gray-300 text-lg leading-relaxed mb-4">
          We're a gang built for people who take their role-play seriously. From running the
          armory to holding down territory, everything we do is meant to make Soulcity feel
          alive — for our own members and everyone we cross paths with.
        </p>
        <p className="text-gray-400 leading-relaxed mb-14">
          Red Network started as a handful of members with a shared idea of what a gang should
          feel like: organized, loyal, and always in motion. That idea is still what runs the
          crew today.
        </p>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14"
        >
          {values.map(({ icon: Icon, title, text }) => (
            <motion.div
              key={title}
              variants={item}
              className="bg-black/60 backdrop-blur-md border border-white/10 rounded-3xl p-6"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#de425b]/15 flex items-center justify-center mb-4">
                <Icon size={18} className="text-[#de425b]" />
              </div>
              <h3 className="font-bold text-white mb-1">{title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{text}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="border-t border-white/10 pt-8">
          <p className="text-white font-bold text-sm tracking-tight">
            #WMatters #lifeinsoulcity #RedNetwork
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;