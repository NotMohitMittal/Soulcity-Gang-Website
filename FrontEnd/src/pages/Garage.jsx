import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Car, Hash, DollarSign, X, Plus, Gauge, Trash2, User, RefreshCw, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

import useGarageStore from "../store/useGarageStore";
import useMemberStore from "../store/useMembersStore";
import useAuthStore from "../store/useAuthStore";
import TiltedCard from "../components/TiltedCard"; 

const GANG_ROLES = [
  "THE BOSS",
  "THE UNDERBOSS/RIGHT_HAND",
  "ADVISOR",
  "CAPOS",
  "SOLDIER/ENFORCER",
  "ASSOCIATE/HANGAROUND",
];

const ADMIN_ROLES = ["THE BOSS", "THE UNDERBOSS/RIGHT_HAND"];
const isAdminRole = (gang_role) => ADMIN_ROLES.includes(gang_role);

const CLASS_META = {
  B: { label: "Class B", color: "#7dd3c0" },
  A: { label: "Class A", color: "#5aa9ff" },
  S: { label: "Class S", color: "#b98af8" },
  X: { label: "Class X", color: "#de425b" },
};
const VEHICLE_CLASSES = Object.keys(CLASS_META);

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } },
};

const emptyForm = {
  vehicle_name: "",
  vehicle_class: "B",
  vehicle_price: "",
  vehicle_plate: "",
  vehicle_color: "#de425b",
  vehicle_owner: "",
};

const Garage = () => {
  const { garage, getGaragePreview, addVehicle, deleteVehicle } = useGarageStore();
  const { members, getMembers } = useMemberStore();
  const { authUser } = useAuthStore();
  const isAdmin = isAdminRole(authUser?.gang_role);

  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);
  
  // Custom Delete Modal State
  const [deleteConfig, setDeleteConfig] = useState({ isOpen: false, id: null, name: "", isDeleting: false });

  const fetchGarageData = async () => {
    await getGaragePreview();
    setIsLoading(false);
    toast.success("Garage refreshed")
  };

  useEffect(() => {
    fetchGarageData();
    if (isAdmin) getMembers();
  }, [isAdmin]);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const openDialog = () => {
    setForm({ ...emptyForm, vehicle_owner: authUser?._id || "" });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.vehicle_name || !form.vehicle_price || !form.vehicle_plate || !form.vehicle_owner) {
      toast.error("Fill in every field before registering the vehicle");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await addVehicle({
        vehicle_name: form.vehicle_name,
        vehicle_owner: form.vehicle_owner,
        vehicle_class: form.vehicle_class,
        vehicle_price: Number(form.vehicle_price),
        vehicle_plate: form.vehicle_plate,
        vehicle_color: form.vehicle_color,
      });

      if (res?.success) {
        toast.success(`${form.vehicle_name} added to the garage`);
        closeDialog();
        getGaragePreview();
      } else {
        toast.error("Could not add the vehicle");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Triggered when a user clicks the scrap icon on a card
  const initiateDelete = (vehicle_id, name) => {
    setDeleteConfig({ isOpen: true, id: vehicle_id, name, isDeleting: false });
  };

  // Triggered when a user clicks "OK" in the custom confirmation modal
  const confirmDelete = async () => {
    setDeleteConfig((prev) => ({ ...prev, isDeleting: true }));
    try {
      const res = await deleteVehicle({ vehicle_id: deleteConfig.id });
      if (res?.success) {
        toast.success(`${deleteConfig.name} removed`);
        getGaragePreview();
      } else {
        toast.error("Could not remove the vehicle");
      }
    } finally {
      setDeleteConfig({ isOpen: false, id: null, name: "", isDeleting: false });
    }
  };

  const groups = useMemo(() => {
    const map = new Map();
    (garage || []).forEach((vehicle) => {
      const key = vehicle.vehicle_name;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(vehicle);
    });
    return Array.from(map.entries()).map(([name, vehicles]) => ({ name, vehicles }));
  }, [garage]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Gauge className="animate-spin text-[#de425b]" size={32} />
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden text-white">
      <div className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 bg-[#de425b]/10 rounded-full blur-[110px]" />
      <div className="pointer-events-none absolute bottom-0 -right-24 w-72 h-72 bg-[#de425b]/5 rounded-full blur-[110px]" />

      <div className="relative z-10 w-full h-full overflow-y-auto pb-10 pr-2">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-end justify-between flex-wrap gap-4"
        >
          <div>
            <p className="text-[#de425b] font-bold text-sm tracking-tight mb-2 uppercase">// THE GARAGE</p>
            <h1 className="text-4xl font-extrabold tracking-tight">Vehicle Roster</h1>
            <p className="text-gray-400 text-sm mt-2 max-w-md">
              Every ride currently claimed by the network, grouped by model.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05, rotate: 15 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchGarageData}
              className="p-3.5 bg-white/5 hover:bg-white/10 hover:text-[#de425b] rounded-2xl transition-all border border-white/10 hover:border-[#de425b]/50 shadow-lg"
              title="Refresh Garage"
            >
              <RefreshCw size={20} />
            </motion.button>

            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-3 flex items-center gap-3">
              <Car size={20} className="text-[#de425b]" />
              <div>
                <p className="text-xl font-extrabold leading-none">{garage?.length || 0}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Vehicles</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={openDialog}
              className="flex items-center gap-2 bg-[#de425b] hover:bg-[#c83850] text-white text-sm font-bold px-5 py-3.5 rounded-2xl transition-colors shadow-lg"
            >
              <Plus size={16} /> Add Vehicle
            </motion.button>
          </div>
        </motion.div>

        {groups.length === 0 ? (
          <div className="border border-dashed border-white/15 rounded-3xl py-24 flex flex-col items-center justify-center text-center gap-3">
            <Car size={28} className="text-gray-600" />
            <p className="text-gray-400 max-w-sm">No vehicles registered yet. Add the first one to the garage.</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {groups.map((group) => (
              <VehicleGroupCard
                key={group.name}
                group={group}
                isAdmin={isAdmin}
                authUser={authUser}
                onDelete={initiateDelete} // Pass the initiate function instead of handling directly
              />
            ))}
          </motion.div>
        )}
      </div>

      <AddVehicleDialog
        isOpen={isDialogOpen}
        onClose={closeDialog}
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isAdmin={isAdmin}
        members={members}
        authUser={authUser}
      />
      
      {/* Custom Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={deleteConfig.isOpen}
        vehicleName={deleteConfig.name}
        isSubmitting={deleteConfig.isDeleting}
        onConfirm={confirmDelete}
        onClose={() => setDeleteConfig({ isOpen: false, id: null, name: "", isDeleting: false })}
      />
    </div>
  );
};

// --- Custom Confirmation Dialog Component ---
const ConfirmDeleteDialog = ({ isOpen, onClose, onConfirm, vehicleName, isSubmitting }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={!isSubmitting ? onClose : undefined}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-4xl bg-[#1a1a1a]/90 backdrop-blur-2xl shadow-2xl p-8 border border-white/10 text-center"
          >
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-5 border border-red-500/20 shadow-inner">
              <AlertTriangle size={28} className="text-[#de425b]" />
            </div>
            
            <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Scrap Vehicle?</h2>
            <p className="text-sm text-gray-400 font-medium mb-8">
              Are you sure you want to permanently remove <span className="text-white font-bold">{vehicleName}</span> from the network garage? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-[#de425b] hover:bg-[#c83850] text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50 shadow-lg shadow-[#de425b]/20"
              >
                {isSubmitting ? "Scrapping..." : "OK"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- Group Card: Transparent Wrapper holding 3D TiltedCards ---
const VehicleGroupCard = ({ group, isAdmin, authUser, onDelete }) => {
  const { name, vehicles } = group;
  const groupClassMeta = CLASS_META[vehicles[0]?.vehicle_class] ?? CLASS_META.B;

  return (
    <motion.div
      variants={itemVariants}
      className="bg-black/20 backdrop-blur-md border border-white/5 hover:border-white/10 rounded-3xl p-6 transition-all duration-300 shadow-xl"
    >
      <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
        <div className="flex items-center gap-4 min-w-0">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner backdrop-blur-md"
            style={{ backgroundColor: `${groupClassMeta.color}15` }}
          >
            <Car size={24} style={{ color: groupClassMeta.color }} />
          </div>
          <div className="min-w-0">
            <p className="text-white text-xl font-black tracking-tight truncate">{name}</p>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              {vehicles.length} {vehicles.length === 1 ? "Unit" : "Units"} Registered
            </span>
          </div>
        </div>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {vehicles.map((vehicle) => {
          const owner = vehicle.vehicle_owner;
          const ownerId = typeof owner === 'object' ? owner?._id : owner;
          const ownerName = typeof owner === 'object' ? owner?.user_name : "Unknown Operator";
          
          const canDelete = isAdmin || ownerId === authUser?._id;
          const classMeta = CLASS_META[vehicle.vehicle_class] ?? CLASS_META.B;

          const overlayUI = (
            <div className="absolute inset-0 w-full h-full flex flex-col p-4 bg-linear-to-t from-black/95 via-black/40 to-transparent rounded-[15px]">
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-md text-[10px] font-mono font-bold text-white uppercase tracking-widest shadow-sm">
                  {vehicle.vehicle_plate}
                </span>
                <span 
                  className="w-5 h-5 rounded-full border-2 border-white/30 shadow-lg" 
                  style={{ backgroundColor: vehicle.vehicle_color || classMeta.color }}
                  title="Paint Color"
                />
              </div>

              <div className="mt-auto flex flex-col relative z-10">
                <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-0.5 flex items-center gap-1.5 truncate">
                  <User size={12} className={ownerId === authUser?._id ? "text-[#de425b]" : "text-gray-500"} /> 
                  {ownerId === authUser?._id ? <span className="text-white">You</span> : ownerName}
                </p>
                <p className="text-white font-black text-xl flex items-center gap-0.5">
                  <DollarSign size={16} className="text-[#de425b]" /> {Number(vehicle.vehicle_price || 0).toLocaleString()}
                </p>
                
                {canDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(vehicle._id, name);
                    }}
                    className="absolute bottom-0 right-0 p-2.5 bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 text-red-200 rounded-xl transition-colors backdrop-blur-md"
                    title="Scrap Vehicle"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          );

          return (
            <motion.div key={vehicle._id} variants={itemVariants} className="w-full h-44 relative">
              <TiltedCard
                imageSrc="/images/thumbnail.jpg" 
                altText={`${name} - ${vehicle.vehicle_plate}`}
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
        })}
      </motion.div>
    </motion.div>
  );
};

// --- Add Vehicle dialog (Remains exactly the same) ---
const AddVehicleDialog = ({ isOpen, onClose, form, onChange, onSubmit, isSubmitting, isAdmin, members, authUser }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl rounded-4xl bg-[#1a1a1a]/60 backdrop-blur-2xl shadow-2xl p-10 md:p-14 max-h-[90vh] overflow-y-auto border border-white/10"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
              Register a Vehicle<span className="text-[#de425b]">.</span>
            </h2>
            <p className="mt-1 text-sm text-gray-300 font-medium">Add a new ride to the network's garage.</p>

            <form onSubmit={onSubmit} className="mt-8 space-y-4 w-full">
              <div className="relative w-full">
                <Car size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  value={form.vehicle_name}
                  onChange={onChange("vehicle_name")}
                  placeholder="Vehicle name (e.g. M4 Competition)"
                  className="w-full rounded-xl bg-black/40 pl-11 pr-4 py-3.5 text-sm font-medium text-white placeholder:text-gray-400 outline-none focus:bg-black/60 transition-colors"
                />
              </div>

              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={form.vehicle_plate}
                    onChange={onChange("vehicle_plate")}
                    placeholder="Plate number"
                    className="w-full rounded-xl bg-black/40 pl-11 pr-4 py-3.5 text-sm font-medium text-white placeholder:text-gray-400 outline-none focus:bg-black/60 transition-colors"
                  />
                </div>
                <div className="relative flex-1">
                  <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.vehicle_price}
                    onChange={onChange("vehicle_price")}
                    placeholder="Price"
                    className="w-full rounded-xl bg-black/40 pl-11 pr-4 py-3.5 text-sm font-medium text-white placeholder:text-gray-400 outline-none focus:bg-black/60 transition-colors"
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Vehicle Class</p>
                <div className="flex gap-2 bg-black/40 rounded-xl p-1.5">
                  {VEHICLE_CLASSES.map((cls) => {
                    const meta = CLASS_META[cls];
                    const active = form.vehicle_class === cls;
                    return (
                      <button
                        type="button"
                        key={cls}
                        onClick={() => onChange("vehicle_class")({ target: { value: cls } })}
                        className="relative flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors"
                        style={{ color: active ? "#fff" : "#9ca3af" }}
                      >
                        {active && (
                          <motion.div
                            layoutId="vehicleClassHighlight"
                            className="absolute inset-0 rounded-lg"
                            style={{ backgroundColor: meta.color }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10">{cls}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-4 bg-black/40 rounded-xl px-4 py-3">
                <span
                  className="w-8 h-8 rounded-full border-2 border-white/20 shrink-0"
                  style={{ backgroundColor: form.vehicle_color }}
                />
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-300">Paint color</p>
                  <p className="text-[10px] text-gray-500">Distinguishes this car from others with the same name</p>
                </div>
                <input
                  type="color"
                  value={form.vehicle_color}
                  onChange={onChange("vehicle_color")}
                  className="w-10 h-10 rounded-lg overflow-hidden bg-transparent border-none cursor-pointer"
                />
              </div>

              {isAdmin ? (
                <div className="relative w-full">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                  <select
                    required
                    value={form.vehicle_owner}
                    onChange={onChange("vehicle_owner")}
                    className="w-full rounded-xl bg-black/40 pl-11 pr-4 py-3.5 text-sm font-medium text-white outline-none focus:bg-black/60 transition-colors appearance-none"
                  >
                    <option value="" className="bg-[#1a1a1a]">
                      Select owner
                    </option>
                    {authUser && (
                      <option value={authUser._id} className="bg-[#1a1a1a]">
                        {authUser.user_name} (You)
                      </option>
                    )}
                    {members
                      ?.filter((m) => m._id !== authUser?._id)
                      .map((m) => (
                        <option key={m._id} value={m._id} className="bg-[#1a1a1a]">
                          {m.user_name}
                        </option>
                      ))}
                  </select>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-black/40 rounded-xl px-4 py-3.5">
                  <User size={16} className="text-gray-400" />
                  <p className="text-sm font-medium text-gray-300">
                    Registering under: <span className="text-white font-bold">{authUser?.user_name}</span>
                  </p>
                </div>
              )}

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-full bg-[#de425b] text-white text-sm font-bold py-4 mt-6 hover:bg-[#c83850] disabled:opacity-60 transition-colors"
              >
                {isSubmitting ? "Registering..." : "Add to Garage"}
              </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Garage;