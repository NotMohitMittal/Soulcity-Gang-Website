import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { User, Camera, Mail, Shield, Calendar, Activity, Star, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import useAuthStore from "../store/useAuthStore";

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
};

const GLASS_PANEL =
  "bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl relative overflow-hidden";

const MyProfile = () => {
  const { authUser, uploadProfilePic } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Trigger the hidden HTML file input
  const handleImageClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      return;
    }

    // Validate file size (15MB limit to match backend multer config)
    if (file.size > 15 * 1024 * 1024) {
      toast.error("Image must be smaller than 15MB");
      return;
    }

    setIsUploading(true);
    const loadingToast = toast.loading("Encrypting and uploading image...");

    try {
      const res = await uploadProfilePic(file);
      if (res.success) {
        toast.success("Profile updated successfully", { id: loadingToast });
      } else {
        toast.error(res.message || "Upload failed", { id: loadingToast });
      }
    } catch (error) {
      toast.error("Network error during upload", { id: loadingToast });
    } finally {
      setIsUploading(false);
      // Reset input so the same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!authUser) return null;

  const joinDate = new Date(authUser.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="w-full h-full relative overflow-x-hidden text-white">
      {/* Ambient Glows */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 bg-[#de425b]/10 rounded-full blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-96 h-96 bg-[#de425b]/5 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-5xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-[#de425b] font-bold text-sm tracking-tight mb-2 uppercase">// IDENTITY CONFIRMED</p>
          <h1 className="text-4xl font-extrabold tracking-tight">Operative Dossier</h1>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* LEFT COLUMN: Identity Card */}
          <motion.div
            variants={itemVariants}
            className={`${GLASS_PANEL} lg:col-span-1 flex flex-col items-center text-center`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#de425b]/10 rounded-full blur-[50px] pointer-events-none" />

            {/* Interactive Avatar */}
            <div className="relative group cursor-pointer mb-6" onClick={handleImageClick}>
              <div
                className={`w-40 h-40 rounded-3xl overflow-hidden border-2 transition-all duration-300 ${isUploading ? "border-gray-500" : "border-[#de425b] group-hover:border-[#c83850] group-hover:shadow-[0_0_20px_rgba(222,66,91,0.3)]"}`}
              >
                {authUser.profile_picture ? (
                  <img
                    src={authUser.profile_picture}
                    alt="Profile"
                    className={`w-full h-full object-cover transition-opacity duration-300 ${isUploading ? "opacity-50 grayscale" : "opacity-100"}`}
                  />
                ) : (
                  <div className="w-full h-full bg-black/60 flex items-center justify-center">
                    <User size={64} className="text-gray-500" />
                  </div>
                )}
              </div>

              {/* Upload Overlay */}
              <div
                className={`absolute inset-0 flex items-center justify-center rounded-3xl bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isUploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
              >
                {isUploading ? (
                  <Loader2 size={32} className="text-white animate-spin" />
                ) : (
                  <div className="flex flex-col items-center text-white">
                    <Camera size={28} className="mb-2" />
                    <span className="text-xs font-bold uppercase tracking-widest">Update Image</span>
                  </div>
                )}
              </div>

              {/* Hidden File Input */}
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>

            <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-1">{authUser.user_name}</h2>
            <p className="text-[#de425b] font-bold text-sm tracking-widest uppercase mb-6">{authUser.gang_role}</p>

            <div className="w-full h-px bg-white/10 mb-6" />

            <div className="w-full space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Status</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${authUser.is_online ? "bg-emerald-500 animate-pulse" : "bg-gray-500"}`}
                  />
                  <span className="text-xs font-bold text-white uppercase">
                    {authUser.is_online ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Clearance</span>
                <span className="text-xs font-bold text-cyan-400 uppercase">
                  {authUser.verified ? "Verified" : "Pending"}
                </span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Detailed Info & Stats */}
          <motion.div variants={itemVariants} className="lg:col-span-2 flex flex-col gap-8">
            {/* Personal Records */}
            <div className={`${GLASS_PANEL} flex-1`}>
              <h3 className="text-lg font-bold uppercase tracking-widest text-gray-200 mb-6 flex items-center gap-3">
                <Shield size={20} className="text-[#de425b]" /> Network Records
              </h3>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Email Field */}
                  <div className="flex flex-col">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Mail size={12} /> Registered Comms
                    </label>
                    <div className="bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-sm font-medium text-gray-300">
                      {authUser.user_email}
                    </div>
                  </div>

                  {/* Join Date */}
                  <div className="flex flex-col">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Calendar size={12} /> Initiation Date
                    </label>
                    <div className="bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-sm font-medium text-gray-300">
                      {joinDate}
                    </div>
                  </div>
                </div>

                <div className="w-full h-px bg-white/5" />

                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Star size={12} /> Role Protocol
                  </label>
                  <div className="bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-sm font-medium text-gray-300 leading-relaxed border-l-2 border-l-[#de425b]">
                    As a <span className="font-bold text-white uppercase">{authUser.gang_role}</span> within the Red
                    Network, you are bound by the syndicates codes of operation.
                    {authUser.gang_role === "THE BOSS" || authUser.gang_role === "THE UNDERBOSS/RIGHT_HAND"
                      ? " You have full administrative access to manage network intel, armory, and personnel."
                      : " Keep your radio active during operations and check the Notice Board for high-priority intel."}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats / Achievements Placeholder */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="bg-linear-to-br from-[#1a1a1a] to-black backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Activity size={14} className="text-blue-400" /> Operations Joined
                </p>
                <p className="text-3xl font-black text-white mt-2">--</p>
                <p className="text-xs text-gray-500 mt-2">Tracking offline</p>
              </div>

              <div className="bg-linear-to-br from-[#1a1a1a] to-black backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl" />
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Activity size={14} className="text-orange-400" /> Network Standing
                </p>
                <p className="text-3xl font-black text-white mt-2">Classified</p>
                <p className="text-xs text-gray-500 mt-2">Clearance required</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default MyProfile;
