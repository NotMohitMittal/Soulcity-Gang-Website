import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crosshair,
  Shield,
  Activity,
  Wrench,
  DollarSign,
  Plus,
  Minus,
  RefreshCw,
  Target,
  Zap,
  Flame,
  Edit2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import useInventoryStore from "../store/useInventoryStore.js";

// --- Translators (DB Keys -> Backend Dictionary & UI Labels) ---
const UPDATE_KEY_MAP = {
  pistol_ammos: "pistol_ammo",
  smg_ammos: "smg_ammo",
  rifle_ammos: "rifle_ammo",
  light: "light_armor",
  medium: "medium_armor",
  heavy: "heavy_armor",
  med_kits: "med_kit",
  bandages: "bandage",
  splints: "splint",
};

const LABEL_MAP = {
  pistol_ammos: "Pistol Ammo",
  smg_ammos: "SMG Ammo",
  rifle_ammos: "Rifle Ammo",
  light: "Light Armor",
  medium: "Medium Armor",
  heavy: "Heavy Armor",
  med_kits: "Med Kits",
  bandages: "Bandages",
  splints: "Splints",
  money: "Clean Money",
  SVC: "SVC Balance",
  EVC: "EVC Balance",
};

const getUpdateKey = (dbKey) => UPDATE_KEY_MAP[dbKey] || dbKey;
const getLabel = (dbKey) => LABEL_MAP[dbKey] || dbKey.charAt(0).toUpperCase() + dbKey.slice(1).replace(/_/g, " ");

// --- UI Configuration Arrays ---
const WEAPON_CATEGORIES = {
  pistols: { title: "Sidearms & Pistols", icon: <Target size={22} /> },
  sub_machines: { title: "Sub-Machine Guns", icon: <Zap size={22} /> },
  assault_rifles: { title: "Assault Rifles", icon: <Flame size={22} /> },
};

const SUPPLY_CATEGORIES = {
  ammos: { title: "Ammunition", icon: <Crosshair size={18} className="text-[#de425b]" /> },
  armors: { title: "Armor", icon: <Shield size={18} className="text-[#de425b]" /> },
  healings: { title: "Medical", icon: <Activity size={18} className="text-[#de425b]" /> },
};

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } },
};

const GLASS_PANEL =
  "bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-[#de425b]/40 hover:shadow-[0_0_25px_rgba(222,66,91,0.12)] transition-all duration-500 relative overflow-hidden flex flex-col";

const Glow = ({ className }) => <div className={`absolute rounded-full blur-3xl pointer-events-none ${className}`} />;

const Inventory = () => {
  const [inventory, setInventory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const { getInventory, updateInventory } = useInventoryStore();

  const fetchInventory = async () => {
    try {
      const response = await getInventory();
      if (response.success) {
        setInventory(response?.data.inventory);
      }
      toast.success("Inventory refreshed")
    } catch (error) {
      toast.error("Failed to load inventory data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleUpdate = async (itemName, amount) => {
    if (isUpdating || amount === 0 || isNaN(amount)) return;
    setIsUpdating(true);

    try {
      const response = await updateInventory(itemName, amount);
      setInventory(response.updatedInventory);
      toast.success(`${amount > 0 ? "Added" : "Removed"} ${Math.abs(amount)} ${itemName.replace(/_/g, " ")}`);
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to update item");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a]">
        <RefreshCw className="animate-spin text-[#de425b]" size={32} />
      </div>
    );
  }

  if (!inventory) return null;

  return (
    <div className="w-full h-full relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-[#de425b]/10 rounded-full blur-[110px]" />
      <div className="pointer-events-none absolute bottom-0 -left-24 w-72 h-72 bg-[#de425b]/5 rounded-full blur-[110px]" />

      <div className="relative z-10 w-full h-full text-white pb-10 overflow-y-auto pr-2">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex justify-between items-end"
        >
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-1">Red-Network Inventory</h1>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#de425b] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#de425b]" />
              </span>
              Real-time sync with gang armory and accounts.
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, rotate: 15 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchInventory}
            className="p-2.5 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:text-[#de425b] rounded-xl transition-all border border-white/10 hover:border-[#de425b]/50 shadow-lg"
          >
            <RefreshCw size={18} />
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* DYNAMIC FINANCES */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="xl:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            {Object.entries(inventory.balance).map(([key, value]) => (
              <StatCard
                key={key}
                title={getLabel(key)}
                value={value}
                icon={<DollarSign />}
                onUpdate={(amt) => handleUpdate(getUpdateKey(key), amt)}
              />
            ))}
          </motion.div>

          {/* DYNAMIC ARMORY: WEAPONS (Col Span 2) */}
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="xl:col-span-2 space-y-6">
            {Object.entries(inventory.armory.weapons).map(([categoryKey, weaponsObj], idx) => {
              const meta = WEAPON_CATEGORIES[categoryKey] || {
                title: getLabel(categoryKey),
                icon: <Target size={22} />,
              };

              // Alternate glow positions for visual rhythm
              const glowPositions = [
                "top-0 left-0 -translate-x-1/3 -translate-y-1/3",
                "bottom-0 right-0 translate-x-1/3 translate-y-1/3",
                "top-0 right-0 -translate-y-1/2 translate-x-1/4",
              ];

              return (
                <motion.div key={categoryKey} variants={itemVariants} whileHover={{ y: -3 }} className={GLASS_PANEL}>
                  <Glow className={`${glowPositions[idx % 3]} w-40 h-40 bg-[#de425b]/10`} />

                  <div className="flex items-center gap-3 mb-5 relative z-10">
                    <div className="p-2.5 bg-black/50 rounded-xl text-[#de425b] shadow-inner">{meta.icon}</div>
                    <h2 className="text-xl font-bold uppercase tracking-wider">{meta.title}</h2>
                  </div>

                  <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10 mt-auto"
                  >
                    {Object.entries(weaponsObj).map(([weaponName, count]) => (
                      <InteractiveCard
                        key={weaponName}
                        label={getLabel(weaponName)}
                        value={count}
                        onUpdate={(amt) => handleUpdate(getUpdateKey(weaponName), amt)}
                      />
                    ))}
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* DYNAMIC SUPPLIES & TOOLS */}
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-6">
            {/* Supplies (Ammos, Armors, Healings) */}
            {Object.entries(SUPPLY_CATEGORIES).map(([key, meta]) => {
              // Ensure the category exists in the DB before mapping
              if (!inventory.armory[key]) return null;

              return (
                <motion.div key={key} variants={itemVariants} whileHover={{ y: -3 }} className={GLASS_PANEL}>
                  <Glow className="top-0 right-0 w-32 h-32 bg-[#de425b]/10 -translate-y-1/3 translate-x-1/3" />
                  <div className="flex items-center gap-2.5 mb-5 relative z-10">
                    {meta.icon}
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-300">{meta.title}</h3>
                  </div>
                  <motion.div variants={containerVariants} className="space-y-2.5 relative z-10 mt-auto">
                    {Object.entries(inventory.armory[key]).map(([itemName, count]) => (
                      <InteractiveCard
                        key={itemName}
                        compact
                        label={getLabel(itemName)}
                        value={count}
                        onUpdate={(amt) => handleUpdate(getUpdateKey(itemName), amt)}
                      />
                    ))}
                  </motion.div>
                </motion.div>
              );
            })}

            {/* Root-Level Tools (Repair Kits) */}
            <motion.div variants={itemVariants} whileHover={{ y: -3 }} className={GLASS_PANEL}>
              <Glow className="bottom-0 left-0 w-32 h-32 bg-[#de425b]/10 translate-y-1/3 -translate-x-1/3" />
              <div className="flex items-center gap-2.5 mb-5 relative z-10">
                <Wrench size={18} className="text-[#de425b]" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-300">Tools</h3>
              </div>
              <div className="relative z-10 mt-auto">
                <InteractiveCard
                  compact
                  label={getLabel("repair_kits")}
                  value={inventory.repair_kits}
                  onUpdate={(amt) => handleUpdate("repair_kit", amt)}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// --- Reusable Animated Components ---

const StatCard = ({ title, value, icon, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleManualSubmit = (modifier) => {
    const amt = parseInt(inputValue, 10);
    if (!isNaN(amt) && amt > 0) {
      onUpdate(modifier === "add" ? amt : -amt);
      setIsEditing(false);
      setInputValue("");
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-black/40 backdrop-blur-xl p-5 rounded-2xl border border-white/10 hover:border-[#de425b]/40 hover:shadow-[0_0_20px_rgba(222,66,91,0.15)] transition-all duration-300 relative overflow-hidden flex flex-col"
    >
      <Glow className="top-0 right-0 w-24 h-24 bg-[#de425b]/10 -translate-y-1/2 translate-x-1/4" />
      <div className="flex items-start justify-between mb-2 relative z-10">
        <div className="flex items-center gap-2 text-gray-400 group-hover:text-[#de425b] transition-colors">
          <div className="p-1.5 rounded-lg bg-black/40 text-gray-400">{React.cloneElement(icon, { size: 16 })}</div>
          <p className="text-xs font-bold uppercase tracking-widest">{title}</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`p-1.5 rounded-lg transition-all ${isEditing ? "bg-[#de425b] text-white" : "bg-white/5 text-gray-400 hover:bg-white/15 hover:text-white"}`}
        >
          {isEditing ? <X size={14} /> : <Edit2 size={14} />}
        </button>
      </div>
      <div className="overflow-hidden mb-1 relative z-10 mt-auto">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={value}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="text-2xl font-black tracking-tight"
          >
            {value.toLocaleString()}
          </motion.p>
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden relative z-10"
          >
            <div className="flex gap-2 pt-3 border-t border-white/10">
              <input
                type="number"
                min="1"
                placeholder="Amount..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 bg-black/50 rounded-lg px-3 py-1.5 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-[#de425b] placeholder:text-gray-600 transition-all"
              />
              <button
                onClick={() => handleManualSubmit("remove")}
                disabled={!inputValue}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/15 text-white rounded-lg font-bold text-xs flex items-center justify-center transition-colors disabled:opacity-50"
              >
                <Minus size={12} />
              </button>
              <button
                onClick={() => handleManualSubmit("add")}
                disabled={!inputValue}
                className="px-3 py-1.5 bg-[#de425b] hover:bg-[#c83850] text-white rounded-lg font-bold text-xs flex items-center justify-center transition-colors disabled:opacity-50"
              >
                <Plus size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const InteractiveCard = ({ label, value, icon, onUpdate, compact = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleManualSubmit = (modifier) => {
    const amt = parseInt(inputValue, 10);
    if (!isNaN(amt) && amt > 0) {
      onUpdate(modifier === "add" ? amt : -amt);
      setIsEditing(false);
      setInputValue("");
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -2, scale: 1.02 }}
      layout
      className={`bg-white/5 backdrop-blur-sm rounded-xl border border-white/5 hover:border-[#de425b]/30 hover:bg-white/10 transition-all overflow-hidden ${compact ? "p-2.5" : "p-3.5"}`}
    >
      <div className="flex justify-between items-center group">
        <div className="flex items-center gap-2.5">
          {icon && <span className="text-[#de425b] bg-[#de425b]/10 p-1.5 rounded-md">{icon}</span>}
          <span className={`${compact ? "text-sm" : "text-base"} font-bold text-gray-200 tracking-wide`}>{label}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={value}
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -14, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={`block font-mono ${compact ? "text-base" : "text-lg"} font-black ${value > 0 ? "text-white" : "text-gray-600"}`}
              >
                {value.toLocaleString()}
              </motion.span>
            </AnimatePresence>
          </div>
          {onUpdate && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`p-1.5 rounded-lg transition-all ${isEditing ? "bg-[#de425b] text-white" : "bg-white/5 text-gray-400 hover:bg-white/15 hover:text-white"}`}
            >
              {isEditing ? <X size={14} /> : <Edit2 size={14} />}
            </button>
          )}
        </div>
      </div>
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="border-t border-white/5 pt-3"
          >
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                placeholder="Qty..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 w-full min-w-0 bg-black/60 rounded-lg px-3 py-1.5 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-[#de425b] placeholder:text-gray-600 transition-all"
              />
              <button
                onClick={() => handleManualSubmit("remove")}
                disabled={!inputValue}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/15 text-white rounded-lg font-bold flex items-center justify-center transition-colors disabled:opacity-50 shrink-0"
              >
                <Minus size={12} />
              </button>
              <button
                onClick={() => handleManualSubmit("add")}
                disabled={!inputValue}
                className="px-3 py-1.5 bg-[#de425b] hover:bg-[#c83850] text-white rounded-lg font-bold flex items-center justify-center transition-colors disabled:opacity-50 shrink-0"
              >
                <Plus size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Inventory;
