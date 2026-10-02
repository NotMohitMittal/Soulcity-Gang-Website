import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Megaphone,
  Plus,
  Settings2,
  X,
  Star,
  Edit2,
  Trash2,
  RefreshCw,
  Users,
  Swords,
  Package,
  ClipboardList,
  CheckSquare,
  Calendar,
  Clock,
  Flame,
} from "lucide-react";
import toast from "react-hot-toast";

import useNoticeStore from "../store/useNoticeStore";
import useMemberStore from "../store/useMembersStore";
import useAuthStore from "../store/useAuthStore";



const ADMIN_ROLES = ["THE BOSS", "THE UNDERBOSS/RIGHT_HAND"];
const isAdminRole = (gang_role) => ADMIN_ROLES.includes(gang_role);


// notice_category -> icon/color. Keys must match the enum in notice.model.js
const CATEGORY_META = {
  Conflict: { icon: Swords, color: "#de425b" },
  "Air Drop": { icon: Package, color: "#5aa9ff" },
  General: { icon: Megaphone, color: "#9ca3af" },
  Requirement: { icon: ClipboardList, color: "#b98af8" },
  Tasks: { icon: CheckSquare, color: "#7dd3c0" },
  Meetings: { icon: Calendar, color: "#f2b84b" },
};
const NOTICE_CATEGORIES = Object.keys(CATEGORY_META);

// notice_priority -> color. Keys must match the enum in notice.model.js
const PRIORITY_META = {
  Low: "#7dd3c0",
  Normal: "#5aa9ff",
  High: "#f2b84b",
  Critical: "#de425b",
};
const NOTICE_PRIORITIES = Object.keys(PRIORITY_META);

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } },
};

const emptyForm = {
  notice_title: "",
  notice_summary: "",
  notice_description: "",
  notice_category: "General",
  notice_priority: "Normal",
};

const DashboardHome = () => {
  const { authUser } = useAuthStore();
  const { members, getMembers } = useMemberStore();
  const { getNotices, createNotice, updateNotice, deleteNotice, setCurrentNotice } = useNoticeStore();
  const isAdmin = isAdminRole(authUser?.gang_role);

  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMembersLoading, setIsMembersLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchNotices = async () => {
    const res = await getNotices();
    if (res?.success) setNotices(res.notices || []);
  };

  const fetchMembers = async () => {
    setIsMembersLoading(true);
    await getMembers();
    setIsMembersLoading(false);
  };

  useEffect(() => {
    (async () => {
      await fetchNotices();
      setIsLoading(false);
    })();
    fetchMembers();
  }, []);

  // The one notice the leader has pinned — this, and only this, is what
  // everyone besides the leader/underboss sees on the board.
  const currentNotice = useMemo(() => notices.find((n) => n.is_current) || null, [notices]);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const openCreateForm = () => {
    setEditingNotice(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const openEditForm = (notice) => {
    setEditingNotice(notice);
    setForm({
      notice_title: notice.notice_title,
      notice_summary: notice.notice_summary,
      notice_description: notice.notice_description,
      notice_category: notice.notice_category,
      notice_priority: notice.notice_priority,
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingNotice(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.notice_title || !form.notice_summary || !form.notice_description) {
      toast.error("Fill in every field before publishing the notice");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = editingNotice
        ? await updateNotice({ notice_id: editingNotice._id, ...form })
        : await createNotice(form);

      if (res?.success) {
        toast.success(editingNotice ? "Notice updated" : "Notice published");
        closeForm();
        fetchNotices();
      } else {
        toast.error("Could not save the notice");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (notice_id, title) => {
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return;
    const res = await deleteNotice({ notice_id });
    if (res?.success) {
      toast.success("Notice deleted");
      fetchNotices();
    } else {
      toast.error("Could not delete the notice");
    }
  };

  const handleSetCurrent = async (notice_id) => {
    const res = await setCurrentNotice({ notice_id });
    if (res?.success) {
      toast.success("Notice pinned to the board");
      fetchNotices();
    } else {
      toast.error("Could not set the current notice");
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden text-white">
      <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 bg-[#de425b]/10 rounded-full blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 -left-24 w-80 h-80 bg-[#de425b]/5 rounded-full blur-[120px]" />

      <div className="relative z-10 w-full h-full overflow-y-auto pb-10 pr-2">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <p className="text-[#de425b] font-bold text-sm tracking-tight mb-2">// OPERATIONS</p>
          <h1 className="text-4xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-2">Everything the network needs to know, in one place.</p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          {/* LEFT COLUMN */}
          <div className="xl:col-span-2 flex flex-col gap-6">
            {/* Notice Board */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="show"
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl flex flex-col overflow-hidden"
            >
              <div className="flex items-center gap-3 p-5 border-b border-white/10">
                <div className="p-2 bg-[#de425b]/15 rounded-xl text-[#de425b]">
                  <Megaphone size={20} />
                </div>
                <h2 className="text-lg font-bold tracking-tight">Notice Board</h2>
              </div>

              <div className="p-6 min-h-[260px] flex-1">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center py-12">
                    <RefreshCw className="animate-spin text-[#de425b]" size={22} />
                  </div>
                ) : currentNotice ? (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentNotice._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        {(() => {
                          const cat = CATEGORY_META[currentNotice.notice_category] ?? CATEGORY_META.General;
                          const CatIcon = cat.icon;
                          return (
                            <span
                              className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                              style={{ backgroundColor: `${cat.color}22`, color: cat.color }}
                            >
                              <CatIcon size={11} /> {currentNotice.notice_category}
                            </span>
                          );
                        })()}
                        <span
                          className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                          style={{
                            backgroundColor: `${PRIORITY_META[currentNotice.notice_priority]}22`,
                            color: PRIORITY_META[currentNotice.notice_priority],
                          }}
                        >
                          {currentNotice.notice_priority === "Critical" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                          )}
                          {currentNotice.notice_priority} priority
                        </span>
                      </div>

                      <h3 className="text-2xl font-black tracking-tight mb-2">{currentNotice.notice_title}</h3>
                      <p className="text-gray-300 font-medium mb-3">{currentNotice.notice_summary}</p>
                      <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">
                        {currentNotice.notice_description}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-5 pt-4 border-t border-white/5">
                        <Clock size={13} />
                        {new Date(currentNotice.createdAt).toLocaleString()}
                        {currentNotice.notice_author?.user_name && (
                          <span>— posted by {currentNotice.notice_author.user_name}</span>
                        )}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center gap-2 py-12">
                    <Megaphone size={26} className="text-gray-600" />
                    <p className="text-gray-400 max-w-xs">
                      {isAdmin
                        ? "No notice is pinned yet — create one and set it as current."
                        : "No notice has been posted yet."}
                    </p>
                  </div>
                )}
              </div>

              {/* Tools and buttons for editing the notice — leader/underboss only */}
              {isAdmin && (
                <div className="flex items-center gap-2 p-3 border-t border-white/10 bg-black/20">
                  <button
                    onClick={openCreateForm}
                    className="flex items-center gap-2 bg-[#de425b] hover:bg-[#c83850] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
                  >
                    <Plus size={14} /> New Notice
                  </button>
                  <button
                    onClick={() => setIsManageOpen(true)}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
                  >
                    <Settings2 size={14} /> Manage Notices
                  </button>
                </div>
              )}
            </motion.div>

            {/* Ongoing War / Drop Heist / Situations — placeholder, built out later */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="show"
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex items-center gap-3 min-h-[120px]"
            >
              <div className="p-2 bg-white/5 rounded-xl text-gray-400">
                <Flame size={18} />
              </div>
              <p className="text-sm font-bold text-gray-400 tracking-wide">
                Ongoing War · Drop Heist · Situations (Bank, Store, Art, Code-Red)
              </p>
            </motion.div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-6">
            {/* Placeholder — built out later */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="show"
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl min-h-[100px]"
            />

            {/* Online Members */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="show"
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <Users size={18} className="text-[#de425b]" />
                  <h2 className="text-sm font-bold uppercase tracking-widest text-gray-300">Online Members</h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.08, rotate: 15 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={fetchMembers}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <RefreshCw size={14} />
                </motion.button>
              </div>

              {/* Scrolls internally only — never grows the dashboard itself */}
              <div className="max-h-[380px] overflow-y-auto p-3 space-y-1.5">
                {isMembersLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <RefreshCw className="animate-spin text-[#de425b]" size={18} />
                  </div>
                ) : members?.length > 0 ? (
                  members.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-bold text-gray-300 shrink-0">
                        {member.user_name?.slice(0, 2).toUpperCase() || "??"}
                      </div>
                      <span className="text-sm font-medium text-gray-200 truncate">{member.user_name}</span>
                      <span className="text-[10px] text-gray-500 truncate ml-auto">{member.gang_role}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 text-xs py-10">No members to show.</p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <NoticeFormDialog
        isOpen={isFormOpen}
        onClose={closeForm}
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isEditing={!!editingNotice}
      />

      <ManageNoticesDialog
        isOpen={isManageOpen}
        onClose={() => setIsManageOpen(false)}
        notices={notices}
        onEdit={(notice) => {
          setIsManageOpen(false);
          openEditForm(notice);
        }}
        onDelete={handleDelete}
        onSetCurrent={handleSetCurrent}
      />
    </div>
  );
};

// --- Create / Edit dialog — same overlay + animation as the registration/vehicle dialogs ---
const NoticeFormDialog = ({ isOpen, onClose, form, onChange, onSubmit, isSubmitting, isEditing }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
            className="relative w-full max-w-xl rounded-4xl bg-[#1a1a1a]/60 backdrop-blur-2xl shadow-2xl p-10 md:p-14 max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
              {isEditing ? "Edit Notice" : "New Notice"}
              <span className="text-[#de425b]">.</span>
            </h2>
            <p className="mt-1 text-sm text-gray-300 font-medium">
              {isEditing ? "Update what the network sees." : "Draft something to post to the board."}
            </p>

            <form onSubmit={onSubmit} className="mt-8 space-y-4 w-full">
              <input
                type="text"
                required
                value={form.notice_title}
                onChange={onChange("notice_title")}
                placeholder="Title"
                className="w-full rounded-xl bg-black/40 px-4 py-3.5 text-sm font-medium text-white placeholder:text-gray-400 outline-none focus:bg-black/60 transition-colors"
              />
              <input
                type="text"
                required
                value={form.notice_summary}
                onChange={onChange("notice_summary")}
                placeholder="Short summary"
                className="w-full rounded-xl bg-black/40 px-4 py-3.5 text-sm font-medium text-white placeholder:text-gray-400 outline-none focus:bg-black/60 transition-colors"
              />
              <textarea
                required
                value={form.notice_description}
                onChange={onChange("notice_description")}
                placeholder="Full description"
                rows={4}
                className="w-full rounded-xl bg-black/40 px-4 py-3.5 text-sm font-medium text-white placeholder:text-gray-400 outline-none focus:bg-black/60 transition-colors resize-none"
              />

              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Category</p>
                <div className="flex flex-wrap gap-2">
                  {NOTICE_CATEGORIES.map((cat) => {
                    const meta = CATEGORY_META[cat];
                    const active = form.notice_category === cat;
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => onChange("notice_category")({ target: { value: cat } })}
                        className="relative px-3 py-2 rounded-lg text-xs font-bold transition-colors"
                        style={{
                          color: active ? "#fff" : "#9ca3af",
                          backgroundColor: active ? meta.color : "rgba(255,255,255,0.05)",
                        }}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Priority</p>
                <div className="flex gap-2 bg-black/40 rounded-xl p-1.5">
                  {NOTICE_PRIORITIES.map((p) => {
                    const active = form.notice_priority === p;
                    return (
                      <button
                        type="button"
                        key={p}
                        onClick={() => onChange("notice_priority")({ target: { value: p } })}
                        className="relative flex-1 py-2.5 rounded-lg text-xs font-bold transition-colors"
                        style={{ color: active ? "#fff" : "#9ca3af" }}
                      >
                        {active && (
                          <motion.div
                            layoutId="noticePriorityHighlight"
                            className="absolute inset-0 rounded-lg"
                            style={{ backgroundColor: PRIORITY_META[p] }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10">{p}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-full bg-[#de425b] text-white text-sm font-bold py-4 mt-2 hover:bg-[#c83850] disabled:opacity-60 transition-colors"
              >
                {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Publish Notice"}
              </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- Manage dialog — pick the current notice, or edit/delete an existing one ---
const ManageNoticesDialog = ({ isOpen, onClose, notices, onEdit, onDelete, onSetCurrent }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
            className="relative w-full max-w-2xl rounded-4xl bg-[#1a1a1a]/60 backdrop-blur-2xl shadow-2xl p-10 md:p-12 max-h-[85vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
              Manage Notices<span className="text-[#de425b]">.</span>
            </h2>
            <p className="mt-1 text-sm text-gray-300 font-medium mb-8">
              Pick what the board shows, or edit/remove a draft.
            </p>

            {notices.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-10">No notices yet — create one first.</p>
            ) : (
              <div className="space-y-2.5">
                {notices.map((notice) => {
                  const cat = CATEGORY_META[notice.notice_category] ?? CATEGORY_META.General;
                  const CatIcon = cat.icon;
                  return (
                    <div
                      key={notice._id}
                      className={`flex items-center gap-3 p-4 rounded-2xl border transition-colors ${
                        notice.is_current ? "border-[#de425b]/50 bg-[#de425b]/10" : "border-white/5 bg-black/30"
                      }`}
                    >
                      <div className="p-2 rounded-xl shrink-0" style={{ backgroundColor: `${cat.color}22` }}>
                        <CatIcon size={16} style={{ color: cat.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{notice.notice_title}</p>
                        <p className="text-xs text-gray-400 truncate">{notice.notice_summary}</p>
                      </div>
                      <button
                        onClick={() => onSetCurrent(notice._id)}
                        title={notice.is_current ? "Currently pinned" : "Set as current"}
                        className={`p-2 rounded-lg transition-colors shrink-0 ${
                          notice.is_current
                            ? "bg-[#de425b] text-white"
                            : "bg-white/5 text-gray-400 hover:bg-white/15 hover:text-white"
                        }`}
                      >
                        <Star size={14} fill={notice.is_current ? "currentColor" : "none"} />
                      </button>
                      <button
                        onClick={() => onEdit(notice)}
                        className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/15 hover:text-white transition-colors shrink-0"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(notice._id, notice.notice_title)}
                        className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DashboardHome;