"use client";

import { useAuth } from "@/lib/AuthContext";
import { createClient } from "@/utils/supabase/client";
import {
  FlameIcon,
  PlusIcon,
  Trash2Icon,
  CheckCircle2Icon,
  ShieldCheckIcon,
  ExternalLinkIcon,
  XIcon,
  AlertTriangleIcon,
  GlobeIcon,
  EyeOffIcon,
  TrophyIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import MainContentWrapper from "@/components/MainContentWrapper";
import PopupTransition from "@/components/global/PopupTransition";

// ─── Types ────────────────────────────────────────────────────────────────────

type Pledge = {
  id: string;
  title: string;
  penalty: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
};

type Checkin = { id: string; pledge_id: string; date: string };

const TODAY = new Date().toISOString().split("T")[0];

// ─── Streak helper ────────────────────────────────────────────────────────────

function computeStreak(checkins: Checkin[], pledgeIds: string[]): number {
  if (pledgeIds.length === 0) return 0;
  const byDate: Record<string, Set<string>> = {};
  for (const c of checkins) {
    if (!byDate[c.date]) byDate[c.date] = new Set();
    byDate[c.date].add(c.pledge_id);
  }
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const cur = new Date();
  cur.setHours(0, 0, 0, 0);
  if (!pledgeIds.every((id) => byDate[TODAY]?.has(id)))
    cur.setDate(cur.getDate() - 1);
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const ds = fmt(cur);
    if (!(byDate[ds] && pledgeIds.every((id) => byDate[ds].has(id)))) break;
    streak++;
    cur.setDate(cur.getDate() - 1);
  }
  return streak;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AccountabilityPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [displayName, setDisplayName] = useState("");
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (user) load();
  }, [user]);

  async function load() {
    if (!user) return;
    setLoading(true);
    const since = new Date();
    since.setDate(since.getDate() - 90);
    const [{ data: prof }, { data: plg }, { data: chk }] = await Promise.all([
      supabase
        .from("public_profiles")
        .select("display_name, show_on_leaderboard")
        .eq("user_id", user.uid)
        .single(),
      supabase
        .from("accountability_pledges")
        .select("id, title, penalty, description, is_active, created_at")
        .eq("user_id", user.uid)
        .eq("is_active", true)
        .order("created_at"),
      supabase
        .from("accountability_checkins")
        .select("id, pledge_id, date")
        .eq("user_id", user.uid)
        .gte("date", since.toISOString().split("T")[0]),
    ]);
    if (prof) {
      setDisplayName(prof.display_name);
      setShowOnLeaderboard(prof.show_on_leaderboard);
      setHasProfile(true);
    } else {
      setDisplayName(user.displayName || user.email?.split("@")[0] || "");
    }
    setPledges(plg ?? []);
    setCheckins(chk ?? []);
    setLoading(false);
  }

  async function saveProfile() {
    if (!user || !displayName.trim()) return;
    setSaving(true);
    await supabase.from("public_profiles").upsert({
      user_id: user.uid,
      display_name: displayName.trim(),
      avatar_url: user.photoURL ?? null,
      show_on_leaderboard: showOnLeaderboard,
      updated_at: new Date().toISOString(),
    });
    setHasProfile(true);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
    setSaving(false);
  }

  async function checkin(pledgeId: string) {
    if (!user) return;
    const { data } = await supabase
      .from("accountability_checkins")
      .upsert({ pledge_id: pledgeId, user_id: user.uid, date: TODAY })
      .select("id, pledge_id, date")
      .single();
    if (data) setCheckins((prev) => [...prev, data]);
  }

  async function deletePledge(id: string) {
    await supabase
      .from("accountability_pledges")
      .update({ is_active: false })
      .eq("id", id);
    setPledges((prev) => prev.filter((p) => p.id !== id));
  }

  const isDoneToday = (id: string) =>
    checkins.some((c) => c.pledge_id === id && c.date === TODAY);

  const streak = computeStreak(checkins, pledges.map((p) => p.id));
  const doneCount = pledges.filter((p) => isDoneToday(p.id)).length;

  return (
    <MainContentWrapper
      topbarBody={
        <div className="flex items-center justify-between flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-brand-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">
              Accountability
            </span>
          </div>
          <div className="flex items-center gap-3">
            {streak > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-orange-50 border border-brand-orange-100">
                <FlameIcon size={12} className="text-brand-orange-500" />
                <span className="text-[10px] font-black text-brand-orange-600 uppercase tracking-wider">
                  {streak} day streak
                </span>
              </div>
            )}
            {hasProfile && (
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-brand-orange-50 hover:text-brand-orange-500 hover:border-brand-orange-100 transition-all"
              >
                <ExternalLinkIcon size={11} />
                View Board
              </Link>
            )}
          </div>
        </div>
      }
    >
      {loading ? (
        <div className="flex-1 flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-orange-500" />
        </div>
      ) : (
        <div className="space-y-8 pb-24">

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass p-5 rounded-[24px] border border-white/60 flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-brand-orange-50 border border-brand-orange-100 flex items-center justify-center shrink-0">
                <FlameIcon size={20} className="text-brand-orange-500" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-0.5">
                  Current Streak
                </p>
                <p className="text-xl font-black text-slate-800 leading-none">
                  {streak}
                  <span className="text-slate-400 font-medium text-sm ml-1">
                    {streak === 1 ? "day" : "days"}
                  </span>
                </p>
              </div>
            </div>

            <div className="glass p-5 rounded-[24px] border border-white/60 flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                <CheckCircle2Icon size={20} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-0.5">
                  Today
                </p>
                <p className="text-xl font-black text-slate-800 leading-none">
                  {doneCount}
                  <span className="text-slate-400 font-medium text-sm ml-1">
                    / {pledges.length} done
                  </span>
                </p>
              </div>
            </div>

            <div className="glass p-5 rounded-[24px] border border-white/60 flex items-center gap-4">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                  showOnLeaderboard
                    ? "bg-blue-50 border border-blue-100"
                    : "bg-slate-50 border border-slate-100"
                }`}
              >
                {showOnLeaderboard ? (
                  <GlobeIcon size={20} className="text-blue-500" />
                ) : (
                  <EyeOffIcon size={20} className="text-slate-400" />
                )}
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-0.5">
                  Visibility
                </p>
                <p className="text-sm font-black text-slate-800 leading-none">
                  {showOnLeaderboard ? "Public" : "Private"}
                </p>
              </div>
            </div>
          </div>

          {/* Two-column grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-7">

            {/* Profile card — narrower */}
            <div className="lg:col-span-2 glass rounded-[32px] border border-white/60 overflow-hidden">
              <div className="p-7 border-b border-brand-orange-50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-orange-50 text-brand-orange-500 flex items-center justify-center border border-brand-orange-100">
                  <ShieldCheckIcon size={15} />
                </div>
                <h3 className="text-base font-black text-slate-800">
                  Public Profile
                </h3>
              </div>

              <div className="p-7 space-y-5">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Display Name
                  </label>
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your public name"
                    className="w-full bg-slate-50/60 border border-slate-100 rounded-[16px] px-4 py-3 text-sm font-bold text-slate-800 placeholder-slate-300 focus:outline-none focus:border-brand-orange-300 focus:bg-white transition-all"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/60 border border-slate-100">
                  <div>
                    <p className="text-sm font-bold text-slate-700">
                      Public leaderboard
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Anyone can see without login
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowOnLeaderboard((v) => !v)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0 ${
                      showOnLeaderboard ? "bg-brand-orange-500" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-0 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                        showOnLeaderboard ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <button
                  onClick={saveProfile}
                  disabled={saving || !displayName.trim()}
                  className="w-full py-3 rounded-[16px] bg-brand-orange-500 text-white text-[11px] font-black uppercase tracking-widest hover:bg-brand-orange-600 transition-all disabled:opacity-50 active:scale-[0.98] shadow-lg shadow-brand-orange-100"
                >
                  {profileSaved ? "Saved ✓" : saving ? "Saving…" : "Save Profile"}
                </button>

                {hasProfile && (
                  <Link
                    href="/"
                    target="_blank"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-[16px] border border-slate-100 bg-slate-50/60 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-brand-orange-50 hover:border-brand-orange-100 hover:text-brand-orange-500 transition-all"
                  >
                    <TrophyIcon size={12} />
                    View Public Board
                  </Link>
                )}
              </div>
            </div>

            {/* Pledges card — wider */}
            <div className="lg:col-span-3 glass rounded-[32px] border border-white/60 overflow-hidden">
              <div className="p-7 border-b border-brand-orange-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-orange-50 text-brand-orange-500 flex items-center justify-center border border-brand-orange-100">
                    <AlertTriangleIcon size={15} />
                  </div>
                  <h3 className="text-base font-black text-slate-800">
                    Daily Pledges
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
                    {pledges.length} / 3
                  </span>
                  <button
                    onClick={() => setShowModal(true)}
                    disabled={pledges.length >= 3}
                    className="flex items-center gap-1.5 bg-brand-orange-500 text-white px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-orange-600 transition-all shadow-md shadow-brand-orange-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <PlusIcon size={13} strokeWidth={2.5} />
                    Add
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-3">
                {pledges.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <div className="w-14 h-14 rounded-2xl bg-brand-orange-50 border border-brand-orange-100 flex items-center justify-center mb-4">
                      <ShieldCheckIcon size={24} className="text-brand-orange-300" />
                    </div>
                    <p className="text-sm font-black text-slate-500 mb-1">
                      No pledges yet
                    </p>
                    <p className="text-xs text-slate-400">
                      Add up to 3 daily commitments above
                    </p>
                  </div>
                ) : (
                  pledges.map((pledge) => {
                    const done = isDoneToday(pledge.id);
                    return (
                      <PledgeRow
                        key={pledge.id}
                        pledge={pledge}
                        done={done}
                        onCheckin={() => checkin(pledge.id)}
                        onDelete={() => deletePledge(pledge.id)}
                      />
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <PopupTransition open={showModal} setOpen={setShowModal}>
        <AddPledgeModal
          userId={user!.uid}
          onClose={() => setShowModal(false)}
          onSaved={(p) => {
            setPledges((prev) => [...prev, p]);
            setShowModal(false);
          }}
        />
      </PopupTransition>
    </MainContentWrapper>
  );
}

// ─── Pledge Row ───────────────────────────────────────────────────────────────

function PledgeRow({
  pledge,
  done,
  onCheckin,
  onDelete,
}: {
  pledge: Pledge;
  done: boolean;
  onCheckin: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${
        done
          ? "bg-emerald-50/60 border-emerald-100"
          : "bg-white/60 border-slate-100 hover:border-brand-orange-100 hover:bg-brand-orange-50/20"
      }`}
    >
      {/* Status icon */}
      <button
        onClick={() => !done && onCheckin()}
        disabled={done}
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
          done
            ? "bg-emerald-100 text-emerald-600"
            : "bg-slate-100 text-slate-300 hover:bg-brand-orange-100 hover:text-brand-orange-500 cursor-pointer"
        }`}
      >
        {done ? (
          <CheckCircle2Icon size={20} strokeWidth={2} />
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-current" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`font-black text-sm leading-snug ${
            done ? "text-emerald-700" : "text-slate-800"
          }`}
        >
          {pledge.title}
        </p>
        {pledge.description && (
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
            {pledge.description}
          </p>
        )}
        <div className="flex items-center gap-1.5 mt-1.5">
          <AlertTriangleIcon size={10} className="text-red-400 shrink-0" />
          <span className="text-[10px] font-black text-red-400 uppercase tracking-wide truncate">
            {pledge.penalty} if skipped
          </span>
        </div>
      </div>

      {/* Right: check-in CTA or done badge + delete */}
      <div className="flex items-center gap-2 shrink-0">
        {done ? (
          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-lg">
            Done ✓
          </span>
        ) : (
          <button
            onClick={onCheckin}
            className="text-[9px] font-black uppercase tracking-widest text-brand-orange-500 bg-brand-orange-50 border border-brand-orange-100 px-3 py-1.5 rounded-lg hover:bg-brand-orange-500 hover:text-white hover:border-brand-orange-500 transition-all"
          >
            Check in
          </button>
        )}
        <button
          onClick={onDelete}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2Icon size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── Add Pledge Modal ─────────────────────────────────────────────────────────

function AddPledgeModal({
  userId,
  onClose,
  onSaved,
}: {
  userId: string;
  onClose: () => void;
  onSaved: (pledge: Pledge) => void;
}) {
  const supabase = createClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [penalty, setPenalty] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!title.trim() || !penalty.trim()) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("accountability_pledges")
      .insert({
        user_id: userId,
        title: title.trim(),
        description: description.trim() || null,
        penalty: penalty.trim(),
        is_active: true,
      })
      .select("id, title, penalty, description, is_active, created_at")
      .single();
    if (!error && data) onSaved(data);
    setSaving(false);
  }

  return (
    <div className="bg-white rounded-[40px] p-10 shadow-2xl border border-slate-100 w-full max-w-md mx-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tighter">
            New Pledge
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            Make a public commitment with stakes.
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
        >
          <XIcon size={16} />
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
            Commitment *
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Work out for 30 minutes"
            className="w-full bg-slate-50 border border-slate-100 rounded-[16px] px-4 py-3 text-sm font-bold text-slate-800 placeholder-slate-300 focus:outline-none focus:border-brand-orange-300 focus:bg-white transition-all"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && penalty.trim() && submit()}
          />
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
            Details{" "}
            <span className="text-slate-300 normal-case font-medium tracking-normal text-xs">
              (optional)
            </span>
          </label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Any extra context"
            className="w-full bg-slate-50 border border-slate-100 rounded-[16px] px-4 py-3 text-sm font-bold text-slate-800 placeholder-slate-300 focus:outline-none focus:border-brand-orange-300 focus:bg-white transition-all"
          />
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
            Penalty if skipped *
          </label>
          <input
            value={penalty}
            onChange={(e) => setPenalty(e.target.value)}
            placeholder="e.g. $10 to charity, cold shower"
            className="w-full bg-red-50/60 border border-red-100 rounded-[16px] px-4 py-3 text-sm font-bold text-slate-800 placeholder-red-200 focus:outline-none focus:border-red-300 focus:bg-white transition-all"
            onKeyDown={(e) => e.key === "Enter" && title.trim() && submit()}
          />
          <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
            <AlertTriangleIcon size={10} className="text-red-400" />
            This appears publicly on the leaderboard.
          </p>
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <button
          onClick={onClose}
          className="flex-1 py-3.5 rounded-2xl border border-slate-100 text-slate-500 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={saving || !title.trim() || !penalty.trim()}
          className="flex-1 py-3.5 rounded-2xl bg-brand-orange-500 text-white text-[11px] font-black uppercase tracking-widest hover:bg-brand-orange-600 transition-all disabled:opacity-40 active:scale-[0.98] shadow-lg shadow-brand-orange-200"
        >
          {saving ? "Saving…" : "Add Pledge"}
        </button>
      </div>
    </div>
  );
}
