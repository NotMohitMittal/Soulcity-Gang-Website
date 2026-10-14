import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, MotionConfig, animate, motion, useMotionValue, useTransform } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  Crown,
  Eye,
  Film,
  MessageCircle,
  Play,
  Radio,
  RefreshCw,
  Sparkles,
  ThumbsUp,
  User,
  Users,
  Video,
  VideoOff,
  WifiOff,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import useStreamStore from "../store/useStreamStore";
import useAuthStore from "../store/useAuthStore";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const formatCount = (value) => {
  const n = Number(value);
  return value === undefined || value === null || !Number.isFinite(n) ? "–" : compact.format(n);
};

const formatDuration = (iso) => {
  const m = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?\$/.exec(iso || "");
  if (!m) return null;
  const hours = Number(m[2] || 0) + Number(m[1] || 0) * 24;
  const mins = Number(m[3] || 0);
  const secs = Number(m[4] || 0);
  if (hours + mins + secs === 0) return null;
  const pad = (n) => String(n).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(mins)}:${pad(secs)}` : `${mins}:${pad(secs)}`;
};

const timeAgo = (iso, now) => {
  const t = new Date(iso).getTime();
  if (!iso || Number.isNaN(t)) return "";
  const mins = Math.floor(Math.max(0, now - t) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
};

const liveFor = (startIso, now) => {
  const t = new Date(startIso).getTime();
  if (!startIso || Number.isNaN(t)) return null;
  const mins = Math.max(0, Math.floor((now - t) / 60000));
  if (mins < 1) return { short: "<1m", label: "Just went live" };
  const hours = Math.floor(mins / 60);
  const short = hours > 0 ? `${hours}h ${mins % 60}m` : `${mins}m`;
  return { short, label: `Live for ${short}` };
};

const pickThumb = (thumbs = {}, order) => {
  for (const key of order) if (thumbs[key]?.url) return thumbs[key].url;
  return null;
};
const cardThumb = (snippet) => pickThumb(snippet?.thumbnails, ["high", "medium", "standard", "default"]);
const heroThumb = (snippet) => pickThumb(snippet?.thumbnails, ["maxres", "standard", "high", "medium"]);

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";

const YT_CATEGORIES = {
  1: "Film",
  2: "Autos",
  10: "Music",
  15: "Animals",
  17: "Sports",
  19: "Travel",
  20: "Gaming",
  22: "Blogs",
  23: "Comedy",
  24: "Entertainment",
  25: "News",
  26: "Style",
  27: "Education",
  28: "Tech",
  29: "Activism",
};

const viewers = (s) => Number(s.liveStreamingDetails?.concurrentViewers || 0);
const views = (v) => Number(v.statistics?.viewCount || 0);
const published = (v) => new Date(v.snippet?.publishedAt || 0).getTime();
const isStillLive = (s) => s.snippet?.liveBroadcastContent !== "none" && !s.liveStreamingDetails?.actualEndTime;

const FOCUS_RING =
  "outline-none focus-visible:ring-2 focus-visible:ring-[#de425b] focus-visible:ring-offset-2 focus-visible:ring-offset-black";

/* ------------------------------------------------------------------ */
/*  Micro Components                                                  */
/* ------------------------------------------------------------------ */

const AnimatedNumber = ({ value }) => {
  const motionValue = useMotionValue(0);
  const text = useTransform(motionValue, (v) => Math.round(v).toLocaleString());
  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 0.8, ease: "easeOut" });
    return () => controls.stop();
  }, [value, motionValue]);
  return <motion.span>{text}</motion.span>;
};

const SegmentBar = ({ filled, total = 8, tone = "dark" }) => (
  <div className="flex gap-1.5" aria-hidden="true">
    {Array.from({ length: total }).map((_, i) => {
      const on = i < filled;
      const solid = tone === "dark" ? "bg-white/30" : "bg-white";
      const dashed = tone === "dark" ? "border-white/10" : "border-white/30";
      return (
        <motion.span
          key={i}
          initial={{ scaleY: 0.3, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ delay: 0.15 + i * 0.04, type: "spring", stiffness: 300, damping: 22 }}
          className={`h-2 flex-1 origin-bottom rounded-full ${on ? solid : `border border-dashed \${dashed}`}`}
        />
      );
    })}
  </div>
);

const Chip = ({ children, className = "" }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase ${className}`}
  >
    {children}
  </span>
);

const Stat = ({ icon: Icon, value }) => (
  <span className="inline-flex items-center gap-1.5">
    <Icon size={13} />
    {value}
  </span>
);

const EmptyState = ({ icon: Icon, title, text, actions = [] }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.97 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center rounded-3xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md px-6 py-16 text-center shadow-lg"
  >
    <div className="mb-5 flex size-16 items-center justify-center rounded-3xl bg-[#111] border border-white/5">
      <Icon size={26} className="text-[#de425b]" />
    </div>
    <h3 className="text-xl font-bold text-white">{title}</h3>
    <p className="mt-2 max-w-sm text-sm text-white/50">{text}</p>
    {actions.length > 0 && (
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            className={`rounded-full px-5 py-2.5 text-sm font-bold transition-all ${FOCUS_RING} ${action.primary ? "bg-[#de425b] text-white hover:bg-[#c83850]" : "bg-white/10 text-white hover:bg-white/15"}`}
          >
            {action.label}
          </button>
        ))}
      </div>
    )}
  </motion.div>
);

const SkeletonCard = () => (
  <div className="animate-pulse rounded-3xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md p-3">
    <div className="aspect-video rounded-2xl bg-[#111]" />
    <div className="space-y-2 px-2 pt-3">
      <div className="h-4 w-4/5 rounded-full bg-white/10" />
      <div className="h-4 w-3/5 rounded-full bg-white/10" />
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Expandable / Collapsible Sidebar                                  */
/* ------------------------------------------------------------------ */

const Sidebar = ({ authUser, activeTab, setActiveTab, isExpanded, setIsExpanded, featuredItem, onOpenItem }) => {
  const isLeader =
    authUser?.gang_role === "THE BOSS" ||
    authUser?.gang_role === "UNDERBOSS" ||
    authUser?.gang_role?.toUpperCase().includes("BOSS");

  const NAV_ITEMS = [
    { id: "live", icon: Radio, label: "Live Streams", badge: "LIVE" },
    { id: "videos", icon: Video, label: "Videos" },
    { id: "povs", icon: Film, label: "POV Highlights" },
  ];

  return (
    <motion.aside
      animate={{ width: isExpanded ? 240 : 72 }}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className="relative hidden shrink-0 flex-col justify-between rounded-[2rem] border border-white/10 bg-[#050505]/80 backdrop-blur-xl py-5 px-3 md:flex select-none z-30 shadow-2xl"
    >
      <div className="flex flex-col gap-6">
        {/* Header Branding & Toggle */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFFFFF] shadow-lg shadow-[#de425b]/25 overflow-hidden">
              <img src="/_logo.png" alt="Logo" className="w-full h-full object-contain p-1.5 scale-125" />
            </div>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <span className="block text-sm font-black tracking-widest text-white uppercase">Red Network</span>
                <span className="text-[10px] text-[#de425b] uppercase font-bold tracking-widest">Soulcity</span>
              </motion.div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#FFFFFF] text-black hover:bg-[#de425b] hover:text-white transition-colors border border-white/20"
          >
            {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex flex-col gap-1.5">
          <span
            className={`px-2 text-[10px] font-bold uppercase tracking-widest text-white/30 ${!isExpanded && "text-center"}`}
          >
            {isExpanded ? "Media Feeds" : "•"}
          </span>
          {NAV_ITEMS.map(({ id, icon: Icon, label, badge }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`relative flex h-11 items-center gap-3 rounded-2xl px-3 transition-colors ${FOCUS_RING} ${
                  active
                    ? "bg-[#de425b] text-white shadow-md shadow-[#de425b]/20"
                    : "text-white/50 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={19} className="shrink-0" />
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 text-left text-sm font-bold truncate"
                  >
                    {label}
                  </motion.span>
                )}
                {isExpanded && badge && activeTab !== id && (
                  <span className="size-2 rounded-full bg-[#de425b] animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Spotlight Mirror (Only visible when sidebar is expanded and there's a feature) */}
        <AnimatePresence>
          {isExpanded && featuredItem?.item && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 px-1 overflow-hidden"
            >
              <span className="px-1 text-[10px] font-bold uppercase tracking-widest text-[#de425b] flex items-center gap-1 mb-2">
                <Sparkles size={10} /> Spotlight
              </span>
              <div
                className="relative aspect-video rounded-xl overflow-hidden bg-black border border-white/10 cursor-pointer group"
                onClick={() => onOpenItem(featuredItem.kind, featuredItem.item)}
              >
                <img
                  src={cardThumb(featuredItem.item.snippet)}
                  alt=""
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-[#de425b] flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play size={14} className="text-white ml-0.5" fill="currentColor" />
                  </div>
                </div>
              </div>
              <p className="text-xs font-bold text-white mt-2 truncate px-1">{featuredItem.item.snippet.title}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer User Info (Handles Public Access) */}
      <div className="flex flex-col gap-3 pt-4 border-t border-white/10 mt-4">
        {authUser ? (
          <div className={`flex items-center gap-3 p-1 rounded-2xl ${isExpanded ? "bg-white/5" : ""}`}>
            {authUser?.profile_picture ? (
              <img
                src={authUser.profile_picture}
                alt=""
                className="size-10 shrink-0 rounded-full object-cover border-2 border-[#de425b]"
              />
            ) : (
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white border-2 border-[#de425b]">
                {initials(authUser.user_name)}
              </div>
            )}
            {isExpanded && (
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="truncate text-xs font-bold text-white">{authUser.user_name}</p>
                <div className="flex items-center gap-1">
                  {isLeader && <Crown size={11} className="text-[#de425b]" />}
                  <p className="truncate text-[10px] uppercase font-bold tracking-wider text-[#de425b]">
                    {authUser.gang_role}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={`flex items-center gap-3 p-1 rounded-2xl ${isExpanded ? "bg-white/5" : ""}`}>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white/50 border border-white/20">
              <User size={16} />
            </div>
            {isExpanded && (
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="truncate text-xs font-bold text-white">Public Access</p>
                <p className="truncate text-[10px] uppercase font-bold tracking-wider text-gray-500">
                  Guest Surveillance
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.aside>
  );
};

/* ------------------------------------------------------------------ */
/*  Bento Row Components                                              */
/* ------------------------------------------------------------------ */

const StatCard = ({ icon: Icon, title, value, unit, chip, filled, accent = false }) => (
  <motion.div
    variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
    className={`flex min-h-[220px] flex-col justify-between rounded-3xl p-6 border backdrop-blur-md transition-all ${
      accent
        ? "bg-[#de425b] border-[#de425b] text-white shadow-xl shadow-[#de425b]/20"
        : "bg-[#0a0a0a]/80 border-white/10 text-white"
    }`}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span
          className={`flex size-10 items-center justify-center rounded-2xl ${accent ? "bg-black/20 text-white" : "bg-white/5 border border-white/5 text-[#de425b]"}`}
        >
          <Icon size={18} />
        </span>
        <span className="font-bold text-sm tracking-widest uppercase opacity-90">{title}</span>
      </div>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${accent ? "bg-black text-white" : "bg-[#de425b]/20 text-[#de425b] border border-[#de425b]/30"}`}
      >
        {chip}
      </span>
    </div>

    <div className="my-2">
      <div className="flex items-baseline gap-2">
        <span className="text-5xl font-black leading-none tracking-tight">
          <AnimatedNumber value={value} />
        </span>
        <span className="text-xs uppercase font-bold opacity-50 tracking-widest">{unit}</span>
      </div>
    </div>
    <SegmentBar filled={filled} tone={accent ? "light" : "dark"} />
  </motion.div>
);

const FeaturedCard = ({ featured, customFeature, loading, onOpen, onRefresh, onOpenFeatureModal, isLeader }) => {
  const activeItem = customFeature?.item || featured?.item;
  const isCustom = !!customFeature?.item;
  const snippet = activeItem?.snippet;
  const isLive = customFeature ? customFeature.kind === "live" : featured?.kind === "live";
  const watching = activeItem?.liveStreamingDetails?.concurrentViewers;
  const thumb = snippet ? heroThumb(snippet) : null;

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
      className="relative flex min-h-[220px] flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md p-6 text-white md:col-span-2 xl:col-span-1 shadow-2xl"
    >
      {thumb && <img src={thumb} alt="" className="absolute inset-0 size-full object-cover opacity-40 scale-105" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

      {/* Leader Feature Control */}
      {isLeader && (
        <button
          type="button"
          onClick={onOpenFeatureModal}
          className="absolute right-4 top-4 z-20 flex items-center gap-1.5 rounded-full bg-black/80 border border-white/10 px-3 py-1.5 text-xs font-bold tracking-wider uppercase text-white backdrop-blur-md hover:bg-[#de425b] hover:border-[#de425b] transition-all"
        >
          <Sparkles size={13} className="text-[#de425b] group-hover:text-white" />
          {isCustom ? "Edit Spotlight" : "Feature Stream"}
        </button>
      )}

      {loading ? (
        <div className="relative z-10 animate-pulse space-y-3">
          <div className="h-5 w-28 rounded-full bg-white/15" />
          <div className="h-6 w-3/4 rounded-full bg-white/15" />
        </div>
      ) : activeItem ? (
        <>
          <div className="relative z-10 max-w-[85%]">
            <Chip className="bg-[#de425b] text-white shadow-lg shadow-[#de425b]/40 backdrop-blur-md">
              <Crown size={12} className="mr-1" />
              FEATURED STREAM
            </Chip>
            {isLive && (
              <span className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-black/80 border border-white/10 px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase text-white backdrop-blur-md">
                <span className="size-3.5 animate-pulse rounded-full bg-white" /> {formatCount(watching)} watching
              </span>
            )}
            <h3 className="mt-4 line-clamp-2 text-2xl font-black leading-tight tracking-tight">{snippet?.title}</h3>
            <p className="mt-1.5 truncate text-xs text-white/60 font-bold uppercase tracking-wider">
              {snippet?.channelTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpen(isLive ? "live" : "video", activeItem)}
            className={`relative z-10 mt-6 flex w-fit items-center justify-center gap-2 rounded-full bg-[#de425b] py-3 px-6 text-sm font-bold text-white transition-all hover:bg-[#c83850] shadow-xl shadow-[#de425b]/20 ${FOCUS_RING}`}
          >
            {isLive ? "Enter Live Operation" : "Watch Highlight"}
            <Play size={14} fill="currentColor" />
          </button>
        </>
      ) : (
        <>
          <div className="relative z-10 max-w-[85%]">
            <Radio size={24} className="text-[#de425b]" />
            <h3 className="mt-4 text-2xl font-black tracking-tight">No active transmission</h3>
            <p className="mt-1 text-xs font-bold text-white/50 uppercase tracking-wider">
              Awaiting spotlight assignment.
            </p>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            className={`relative z-10 mt-6 flex w-fit items-center justify-center gap-2 rounded-full bg-white/10 border border-white/10 py-3 px-6 text-sm font-bold text-white transition hover:bg-white/20 ${FOCUS_RING}`}
          >
            Check Signals <RefreshCw size={14} />
          </button>
        </>
      )}
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/*  Media Grid Cards                                                  */
/* ------------------------------------------------------------------ */

const MediaCard = ({ title, thumb, overlay, onOpen, children }) => (
  <motion.div
    variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
    role="button"
    tabIndex={0}
    onClick={onOpen}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onOpen();
      }
    }}
    className={`group cursor-pointer rounded-3xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md p-3 transition-all hover:border-[#de425b]/50 hover:bg-[#111] shadow-lg ${FOCUS_RING}`}
  >
    <div className="relative aspect-video overflow-hidden rounded-2xl bg-black border border-white/5">
      {thumb && (
        <img
          src={thumb}
          alt=""
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
      {overlay}
      <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-black/20 backdrop-blur-sm">
        <span className="flex size-14 items-center justify-center rounded-full bg-[#de425b] text-white shadow-2xl scale-90 group-hover:scale-100 transition-transform">
          <Play size={20} className="ml-1" fill="currentColor" />
        </span>
      </span>
    </div>
    <div className="px-2 pb-2 pt-4">{children}</div>
  </motion.div>
);

const LiveCard = ({ stream, now, onOpen }) => {
  const s = stream.snippet || {};
  const live = stream.liveStreamingDetails || {};
  const category = YT_CATEGORIES[s.categoryId];

  return (
    <MediaCard
      title={s.title}
      thumb={cardThumb(s)}
      onOpen={onOpen}
      overlay={
        <>
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[#de425b] px-2.5 py-1 text-[10px] font-black tracking-widest text-white shadow-md uppercase">
            <span className="size-1.5 animate-pulse rounded-full bg-white" /> LIVE
          </span>
          <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/80 border border-white/10 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">
            <Users size={12} className="text-[#de425b]" /> {formatCount(live.concurrentViewers)}
          </span>
        </>
      }
    >
      <h3 className="line-clamp-2 min-h-[2.5rem] font-black text-sm text-white leading-snug tracking-tight group-hover:text-[#de425b] transition-colors">
        {s.title}
      </h3>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-[#de425b]">
            {initials(s.channelTitle)}
          </span>
          <span className="min-w-0 flex-1 truncate text-xs font-bold text-white/60 uppercase tracking-wider">
            {s.channelTitle}
          </span>
        </div>
        {category && <Chip className="bg-white/5 border border-white/10 text-white/40">{category}</Chip>}
      </div>
    </MediaCard>
  );
};

const VideoCard = ({ video, now, onOpen }) => {
  const s = video.snippet || {};
  const stats = video.statistics || {};
  const duration = formatDuration(video.contentDetails?.duration);
  const isHD = video.contentDetails?.definition === "hd";

  return (
    <MediaCard
      title={s.title}
      thumb={cardThumb(s)}
      onOpen={onOpen}
      overlay={
        <>
          <span className="absolute left-3 top-3 flex gap-1.5">
            {isHD && (
              <span className="rounded-md bg-black/80 border border-white/10 px-2 py-0.5 text-[10px] font-black text-white backdrop-blur-md uppercase tracking-widest">
                HD
              </span>
            )}
          </span>
          {duration && (
            <span className="absolute bottom-3 right-3 rounded-md bg-black/90 border border-white/10 px-2 py-1 text-[11px] font-bold text-white tracking-wider">
              {duration}
            </span>
          )}
        </>
      }
    >
      <h3 className="line-clamp-2 min-h-[2.5rem] font-black text-sm text-white leading-snug tracking-tight group-hover:text-[#de425b] transition-colors">
        {s.title}
      </h3>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/60">
            {initials(s.channelTitle)}
          </span>
          <span className="min-w-0 flex-1 truncate text-xs font-bold text-white/60 uppercase tracking-wider">
            {s.channelTitle}
          </span>
        </div>
        <span className="shrink-0 text-[10px] font-bold uppercase text-white/40">{timeAgo(s.publishedAt, now)}</span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-white/40">
        <Stat icon={Eye} value={`${formatCount(stats.viewCount)}`} />
        <Stat icon={ThumbsUp} value={formatCount(stats.likeCount)} />
        <Stat icon={MessageCircle} value={formatCount(stats.commentCount)} />
      </div>
    </MediaCard>
  );
};

/* ------------------------------------------------------------------ */
/*  Leader Feature Modal                                              */
/* ------------------------------------------------------------------ */

const LeaderFeatureModal = ({ isOpen, onClose, onSetFeature, videos, liveStreams }) => {
  const [selectedId, setSelectedId] = useState("");
  if (!isOpen) return null;

  const handleSave = () => {
    const foundStream = liveStreams.find((s) => s.id === selectedId);
    if (foundStream) {
      onSetFeature({ kind: "live", item: foundStream });
      toast.success("Spotlight updated with active stream!");
      onClose();
      return;
    }
    const foundVideo = videos.find((v) => v.id === selectedId);
    if (foundVideo) {
      onSetFeature({ kind: "video", item: foundVideo });
      toast.success("Spotlight updated with video!");
      onClose();
      return;
    }
    toast.error("Please choose a stream or video");
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0a0a0a] p-6 text-white shadow-2xl">
        <div className="flex items-center gap-2 mb-4 text-[#de425b]">
          <Crown size={24} />
          <h2 className="text-xl font-black tracking-tight text-white uppercase">Spotlight Control</h2>
        </div>
        <p className="text-xs font-bold tracking-wider uppercase text-white/40 mb-6">
          Select a broadcast to pin to the main dashboard.
        </p>

        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-[#111] p-3 text-sm font-bold text-white mb-6 outline-none focus:border-[#de425b] cursor-pointer"
        >
          <option value="">-- Choose intel --</option>
          <optgroup label="Live Broadcasts">
            {liveStreams.map((s) => (
              <option key={s.id} value={s.id}>
                [LIVE] {s.snippet.title}
              </option>
            ))}
          </optgroup>
          <optgroup label="Archived Video">
            {videos.map((v) => (
              <option key={v.id} value={v.id}>
                [VIDEO] {v.snippet.title}
              </option>
            ))}
          </optgroup>
        </select>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#111] border border-white/10 px-5 py-2.5 text-xs font-bold tracking-widest uppercase hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-full bg-[#de425b] px-5 py-2.5 text-xs font-bold tracking-widest uppercase hover:bg-[#c83850]"
          >
            Pin to Spotlight
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

/* ------------------------------------------------------------------ */
/*  Main Streams Hub                                                  */
/* ------------------------------------------------------------------ */

const Stream = () => {
  const navigate = useNavigate();
  const { youtubeStreams, youtubeVideos, getYoutubeLive, getYoutubeVideos } = useStreamStore();
  const { authUser } = useAuthStore();

  const isLeader =
    authUser?.gang_role === "THE BOSS" ||
    authUser?.gang_role === "UNDERBOSS" ||
    authUser?.gang_role?.toUpperCase().includes("BOSS");

  const [activeTab, setActiveTab] = useState("live");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true); // Default to true
  const [isFetching, setIsFetching] = useState(true);
  const [checkedAt, setCheckedAt] = useState(null);
  const [now, setNow] = useState(() => Date.now());
  const [customFeature, setCustomFeature] = useState(null);
  const [featureModalOpen, setFeatureModalOpen] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const fetchFeed = useCallback(
    async ({ manual = false } = {}) => {
      setIsFetching(true);
      const [liveRes, videoRes] = await Promise.all([getYoutubeLive(), getYoutubeVideos()]);
      setCheckedAt(new Date());
      setNow(Date.now());
      setIsFetching(false);
      if (manual) {
        if (liveRes?.success && videoRes?.success) toast.success("Intel synced securely");
        else toast.error("Signal interference detected");
      }
    },
    [getYoutubeLive, getYoutubeVideos],
  );

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const liveStreams = useMemo(
    () => (youtubeStreams ?? []).filter(isStillLive).sort((a, b) => viewers(b) - viewers(a)),
    [youtubeStreams],
  );
  const videos = useMemo(() => [...(youtubeVideos ?? [])].sort((a, b) => published(b) - published(a)), [youtubeVideos]);

  const liveLoading = isFetching && youtubeStreams === null;
  const videosLoading = isFetching && youtubeVideos === null;

  const totalWatching = liveStreams.reduce((sum, s) => sum + viewers(s), 0);
  const totalVideoViews = videos.reduce((sum, v) => sum + views(v), 0);

  const defaultFeatured = useMemo(() => {
    if (liveStreams[0]) return { kind: "live", item: liveStreams[0] };
    if (videos.length) return { kind: "video", item: [...videos].sort((a, b) => views(b) - views(a))[0] };
    return null;
  }, [liveStreams, videos]);

  const activeFeature = customFeature || defaultFeatured;

  // New openItem function that redirects to YouTube directly
  const openItem = useCallback((kind, item) => {
    window.open(`https://youtube.com/watch?v=${item.id}`, "_blank", "noopener,noreferrer");
  }, []);

  const refresh = () => fetchFeed({ manual: true });

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative h-screen w-full bg-black p-3 text-white md:p-5 flex flex-col overflow-hidden font-sans z-0">
        {/* --- BACKGROUND CONFIGURATION --- */}
        {/* OPTION 1: Background Video (Uncomment the `<video>` block to use) */}
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0 opacity-90">
          <source src="/videos/bg.mp4" type="video/mp4" />
        </video>

        {/* OPTION 2: Background Image (Currently Active) */}
        {/* <div className="absolute inset-0 w-full h-full bg-[url('/images/thumbnail.jpg')] bg-cover bg-center bg-no-repeat opacity-20 z-0" /> */}

        {/* Dark vignette overlay for readability */}
        {/* <div className="absolute inset-0 bg-black/70 z-0" /> */}
        {/* -------------------------------- */}

        {/* Main Content & Sidebar (Elevated above background via z-10) */}
        <div className="relative z-10 flex h-full min-h-0 w-full gap-4 md:gap-5">
          <Sidebar
            authUser={authUser}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isExpanded={isSidebarExpanded}
            setIsExpanded={setIsSidebarExpanded}
            featuredItem={activeFeature}
            onOpenItem={openItem}
          />

          <main className="relative flex-1 flex flex-col h-full min-w-0 overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#050505]/70 backdrop-blur-xl shadow-2xl">
            <div className="relative h-full overflow-y-auto p-5 custom-scrollbar md:p-8">
              {/* Header */}
              <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black tracking-tight md:text-5xl text-white uppercase leading-tight">
                    {activeTab === "live" && (
                      <>
                        <span className="text-white">Live-</span>
                        <span className="text-[#de425b]">Streams</span>
                      </>
                    )}
                    {activeTab === "videos" && (
                      <>
                        <span className="text-white">Video-</span>
                        <span className="text-[#de425b]">Archives</span>
                      </>
                    )}
                    {activeTab === "povs" && (
                      <>
                        <span className="text-white">Member-</span>
                        <span className="text-[#de425b]">POVs</span>
                      </>
                    )}
                  </h1>
                </div>
                <div className="flex items-center gap-3">
                  {/* Back Button */}
                  <motion.button
                    whileHover={{ scale: 1.05, x: -3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(-1)}
                    className={`flex items-center justify-center size-11 rounded-full bg-[#111] border border-white/10 text-white/70 hover:text-white transition-colors hover:bg-white/10 shadow-lg ${FOCUS_RING}`}
                    title="Back to Dashboard | Home"
                  >
                    <ArrowLeft size={18} />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={refresh}
                    disabled={isFetching}
                    title="Sync for every user"
                    className={`flex items-center gap-2 rounded-full bg-[#de425b] px-6 py-3 text-xs font-bold tracking-widest uppercase text-white transition-all hover:bg-[#c83850] shadow-xl shadow-[#de425b]/20 disabled:opacity-60 ${FOCUS_RING}`}
                  >
                    <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} /> Sync
                  </motion.button>
                </div>
              </div>

              {/* Bento Row */}
              <div className="mb-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1.4fr]">
                <StatCard
                  icon={Radio}
                  title="Live Members"
                  value={liveStreams.length}
                  unit="Live on YouTube"
                  chip={
                    <>
                      <Users size={12} /> {formatCount(totalWatching)}
                    </>
                  }
                  filled={Math.min(liveStreams.length, 8)}
                />
                <StatCard
                  accent
                  icon={Play}
                  title="Uploaded Videos"
                  value={videos.length}
                  unit="Uploads"
                  chip={
                    <>
                      <Eye size={12} /> {formatCount(totalVideoViews)}
                    </>
                  }
                  filled={Math.min(videos.length, 8)}
                />
                <FeaturedCard
                  featured={defaultFeatured}
                  customFeature={customFeature}
                  loading={liveLoading && videosLoading}
                  onOpen={openItem}
                  onRefresh={refresh}
                  onOpenFeatureModal={() => setFeatureModalOpen(true)}
                  isLeader={isLeader}
                />
              </div>

              {/* Tabs */}
              <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab("live")}
                    className={`rounded-full px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "live" ? "bg-[#de425b] text-white shadow-lg shadow-[#de425b]/20" : "bg-[#111]/80 backdrop-blur-md text-white/50 hover:bg-white/10 hover:text-white"}`}
                  >
                    Live Feeds ({liveStreams.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("videos")}
                    className={`rounded-full px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "videos" ? "bg-[#de425b] text-white shadow-lg shadow-[#de425b]/20" : "bg-[#111]/80 backdrop-blur-md text-white/50 hover:bg-white/10 hover:text-white"}`}
                  >
                    Archives ({videos.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("povs")}
                    className={`rounded-full px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "povs" ? "bg-[#de425b] text-white shadow-lg shadow-[#de425b]/20" : "bg-[#111]/80 backdrop-blur-md text-white/50 hover:bg-white/10 hover:text-white"}`}
                  >
                    Member POV
                  </button>
                </div>
                {checkedAt && (
                  <span className="text-[10px] font-bold tracking-widest uppercase text-white/40 hidden sm:block">
                    Sync: {checkedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </div>

              {/* Media Grids */}
              {activeTab === "live" &&
                (liveLoading ? (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <SkeletonCard key={i} />
                    ))}
                  </div>
                ) : liveStreams.length === 0 ? (
                  <EmptyState
                    icon={VideoOff}
                    title="Radio Silence"
                    text="No syndicate members are currently broadcasting."
                    actions={[{ label: "Scan Again", onClick: refresh, primary: true }]}
                  />
                ) : (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {liveStreams.map((stream) => (
                      <LiveCard key={stream.id} stream={stream} now={now} onOpen={() => openItem("live", stream)} />
                    ))}
                  </div>
                ))}

              {activeTab === "videos" &&
                (videosLoading ? (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <SkeletonCard key={i} />
                    ))}
                  </div>
                ) : videos.length === 0 ? (
                  <EmptyState
                    icon={WifiOff}
                    title="No Archives Found"
                    text="No secure video records currently match syndicate criteria."
                    actions={[{ label: "Refresh DB", onClick: refresh, primary: true }]}
                  />
                ) : (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {videos.map((video) => (
                      <VideoCard key={video.id} video={video} now={now} onOpen={() => openItem("video", video)} />
                    ))}
                  </div>
                ))}

              {activeTab === "povs" && (
                <EmptyState
                  icon={Film}
                  title="POV Logs Empty"
                  text="Personal operator perspectives are currently unavailable in the databanks."
                  actions={[
                    { label: "Upload Intel", onClick: () => toast("POV upload portal offline"), primary: true },
                  ]}
                />
              )}
            </div>
          </main>
        </div>

        {/* Leader Modal */}
        <LeaderFeatureModal
          isOpen={featureModalOpen}
          onClose={() => setFeatureModalOpen(false)}
          onSetFeature={setCustomFeature}
          videos={videos}
          liveStreams={liveStreams}
        />
      </div>
    </MotionConfig>
  );
};

export default Stream;
