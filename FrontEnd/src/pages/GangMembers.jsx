import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UsersRound,
  Crown,
  Star,
  ShieldCheck,
  UserPlus,
  ShieldAlert,
  ChevronDown,
  Check,
  X,
  BrainCircuit,
  Swords,
  UserRound,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

import TiltedCard from "../components/TiltedCard";
import useMemberStore from "../store/useMembersStore"; 
import useAuthStore from "../store/useAuthStore";

const GANG_ROLES = [
  "THE BOSS",
  "THE UNDERBOSS/RIGHT_HAND",
  "ADVISOR",
  "CAPOS",
  "SOLDIER/ENFORCER",
  "ASSOCIATE/HANGAROUND",
];

const LEADER_ROLES = ["THE BOSS", "THE UNDERBOSS/RIGHT_HAND"];

// icon + color per gang_role — keys must match the enum in user.model.js
const ROLE_STYLES = {
  "THE BOSS": { icon: Crown, color: "#de425b" },
  "THE UNDERBOSS/RIGHT_HAND": { icon: ShieldCheck, color: "#f2b84b" },
  ADVISOR: { icon: BrainCircuit, color: "#7dd3c0" },
  CAPOS: { icon: Star, color: "#b98af8" },
  "SOLDIER/ENFORCER": { icon: Swords, color: "#5aa9ff" },
  "ASSOCIATE/HANGAROUND": { icon: UserRound, color: "#9ca3af" },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } },
};

const GangMembers = () => {
  const [activeTab, setActiveTab] = useState("roster");
  
  const { authUser } = useAuthStore();
  const { 
    members, 
    memberRequests, 
    getMembers, 
    getRequests, 
    verifyRequest, 
    changeRole, 
    removeRole,
    rejectRequest 
  } = useMemberStore();

  const isLeader = LEADER_ROLES.includes(authUser?.gang_role);

  const fetchAllData = async () => {
    await getMembers();
    if (isLeader) await getRequests();
  };

  useEffect(() => {
    fetchAllData();
  }, [isLeader]);

  const handleVerify = async (member_id) => {
    const res = await verifyRequest({ member_id });
    if (res?.success) {
      toast.success("Recruit verified and added to roster!");
      fetchAllData(); 
    } else {
      toast.error("Failed to verify recruit");
    }
  };

  // New decline handler
  const handleReject = async (member_id, name) => {
    if (!window.confirm(`Are you sure you want to permanently decline ${name}'s request?`)) return;
    
    const res = await rejectRequest({ member_id });
    if (res?.success) {
      toast.success(`${name}'s request was declined and deleted.`);
      fetchAllData();
    } else {
      toast.error("Failed to reject request");
    }
  };

  const handleKick = async (member_id, name) => {
    if (!window.confirm(`Are you sure you want to kick ${name} from the network?`)) return;
    
    // Note: ensure removeRole passes { member_id } in your store!
    const res = await removeRole({ member_id }); 
    if (res?.success) {
      toast.success(`${name} has been removed.`);
      fetchAllData();
    } else {
      toast.error("Failed to remove member");
    }
  };

  const handleRoleChange = async (member_id, new_role) => {
    const res = await changeRole({ member_id, new_role });
    if (res?.success) {
      toast.success("Gang role updated!");
      fetchAllData();
    } else {
      toast.error("Failed to update role");
    }
  };

  return (
    <div className="w-full h-full text-white pb-10 overflow-y-auto pr-2">
      {/* ... Header and Tabs remain exactly the same ... */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="text-[#de425b] font-bold text-sm tracking-tight mb-2 uppercase">// The Roster</p>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">Red-Network Members</h1>
            <p className="text-gray-400 text-sm max-w-md">Manage operators, promote soldiers, and review pending recruit applications.</p>
          </div>
          <div className="bg-[#1f2229] border border-white/5 rounded-2xl px-5 py-3 flex items-center gap-4 shadow-lg">
            <UsersRound size={20} className="text-[#de425b]" />
            <div>
              <p className="text-xl font-extrabold leading-none">{members?.length || 0}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Active</p>
            </div>
          </div>
        </div>
      </motion.div>

      {isLeader && (
        <div className="flex gap-4 mb-6 border-b border-white/10 pb-4">
          <button onClick={() => setActiveTab("roster")} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === "roster" ? "bg-[#de425b] text-white shadow-lg" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}>
            <ShieldCheck size={16} /> Active Roster
          </button>
          <button onClick={() => setActiveTab("requests")} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all relative ${activeTab === "requests" ? "bg-[#de425b] text-white shadow-lg" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}>
            <UserPlus size={16} /> Pending Requests
            {memberRequests?.length > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />}
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {activeTab === "roster" ? (
          <motion.div key="roster" variants={containerVariants} initial="hidden" animate="show" exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 ">
            {members?.length > 0 ? members.map((member) => (
              <MemberCard key={member._id} member={member} isLeader={isLeader} isSelf={authUser?._id === member._id} onRoleChange={handleRoleChange} onKick={handleKick} />
            )) : <div className="col-span-full py-10 text-center text-gray-500 font-medium">No active members found.</div>}
          </motion.div>
        ) : (
          <motion.div key="requests" variants={containerVariants} initial="hidden" animate="show" exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {memberRequests?.length > 0 ? memberRequests.map((req) => (
              <RequestCard key={req._id} request={req} onVerify={handleVerify} onReject={handleReject} />
            )) : <div className="col-span-full py-20 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl"><ShieldAlert size={32} className="text-gray-600 mb-3" /><p className="text-gray-400 font-medium">No pending recruit requests.</p></div>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Active Roster Card (same shape/animation as the Garage vehicle card) ---
const MemberCard = ({ member, isLeader, isSelf, onRoleChange, onKick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const style = ROLE_STYLES[member.gang_role] ?? ROLE_STYLES["ASSOCIATE/HANGAROUND"];
  const RoleIcon = style.icon;

  // No real avatar yet? Fall back to a generated initials avatar so
  // TiltedCard always has something to tilt.
  const avatarUrl =
    member.profileImageUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user_name || "??")}&background=0d0d0d&color=${style.color.slice(
      1,
    )}&bold=true&size=400`;

  // The UI injected into the 3D TiltedCard
  const overlayUI = (
    <div className="absolute inset-0 w-full h-full flex flex-col p-10 bg-linear-to-t from-black/95 via-black/40 to-transparent rounded-[15px]">
      {/* Top: role badge & "YOU" tag */}
      <div className="flex justify-between items-start">
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-md text-[10px] font-bold uppercase tracking-widest shadow-sm"
          style={{ color: style.color }}
        >
          <RoleIcon size={11} />
          {member.gang_role}
        </span>
        {isSelf && (
          <span className="text-[10px] font-bold bg-white/10 backdrop-blur-md px-2 py-1 rounded-md text-gray-200">
            YOU
          </span>
        )}
      </div>

      {/* Bottom: name, and leader-only role/kick controls */}
      <div className="mt-auto flex flex-col relative z-10">
        <p className="text-white font-black text-xl truncate">{member.user_name}</p>

        {isLeader && !isSelf && (
          <div className="flex gap-2 mt-3">
            <div className="relative flex-1">
              <button
                onClick={() => setIsDropdownOpen((v) => !v)}
                className="w-full bg-black/50 hover:bg-black/70 backdrop-blur-md px-3 py-2 rounded-xl text-xs font-bold text-gray-200 flex items-center justify-between transition-colors border border-white/10"
              >
                Change Role <ChevronDown size={14} />
              </button>
              {isDropdownOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-full bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-1 z-20 overflow-hidden">
                  {GANG_ROLES.map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        onRoleChange(member._id, role);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-[10px] font-bold tracking-wider hover:bg-[#de425b]/20 hover:text-[#de425b] transition-colors ${role === member.gang_role ? "text-[#de425b] bg-[#de425b]/10" : "text-gray-400"}`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => onKick(member._id, member.user_name)}
              className="p-2.5 bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 text-red-200 rounded-xl transition-colors backdrop-blur-md"
              title="Kick from network"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <motion.div variants={itemVariants} className="w-full h-56 relative">
      <TiltedCard
        imageSrc={avatarUrl}
        altText={member.user_name}
        containerHeight="100%"
        containerWidth="100%"
        imageHeight="100%"
        imageWidth="100%"
        rotateAmplitude={12}
        scaleOnHover={1.03}
        showMobileWarning={false}
        showTooltip={false}
        displayOverlayContent={true}
        overlayContent={overlayUI}
      />
    </motion.div>
  );
};

// --- Pending Request Card ---
const RequestCard = ({ request, onVerify, onReject }) => {
  return (
    <motion.div 
      variants={itemVariants} 
      whileHover={{ y: -4, scale: 1.01 }}
      className="bg-[#1f2229] border border-[#de425b]/20 hover:border-[#de425b]/50 rounded-3xl p-5 flex items-center justify-between shadow-xl transition-all duration-300 group"
    >
      <div className="flex flex-col">
        <p className="text-white font-bold text-lg group-hover:text-[#de425b] transition-colors">{request.user_name}</p>
        <p className="text-xs text-gray-400">{request.user_email}</p>
        <p className="text-[10px] text-[#de425b] font-bold uppercase tracking-widest mt-2">Awaiting Approval</p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => onReject(request._id, request.user_name)} className="p-2.5 bg-black/40 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-xl transition-colors hover:scale-110 active:scale-95" title="Reject & Delete">
          <X size={18} />
        </button>
        <button onClick={() => onVerify(request._id)} className="p-2.5 bg-[#de425b] hover:bg-[#c83850] text-white rounded-xl shadow-lg transition-all hover:scale-110 active:scale-95 hover:shadow-[0_0_15px_rgba(222,66,91,0.4)]" title="Approve Recruit">
          <Check size={18} />
        </button>
      </div>
    </motion.div>
  );
};

export default GangMembers;