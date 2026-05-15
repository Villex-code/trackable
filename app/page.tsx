import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { FlameIcon, ShieldCheckIcon, TrophyIcon } from "lucide-react";

type Profile = {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
};

type Pledge = {
  id: string;
  user_id: string;
  title: string;
  penalty: string;
};

type Checkin = {
  pledge_id: string;
  user_id: string;
  date: string;
};

type LeaderboardEntry = {
  profile: Profile;
  pledges: Pledge[];
  streak: number;
  totalCheckins: number;
};

function calculateStreak(
  checkins: Checkin[],
  pledgeIds: string[]
): number {
  if (pledgeIds.length === 0) return 0;

  const byDate: Record<string, Set<string>> = {};
  for (const c of checkins) {
    if (!byDate[c.date]) byDate[c.date] = new Set();
    byDate[c.date].add(c.pledge_id);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const fmt = (d: Date) => d.toISOString().split("T")[0];

  const todayStr = fmt(today);
  const todayDone = pledgeIds.every((id) => byDate[todayStr]?.has(id));

  const cur = new Date(today);
  if (!todayDone) cur.setDate(cur.getDate() - 1);

  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const ds = fmt(cur);
    const done = byDate[ds] && pledgeIds.every((id) => byDate[ds].has(id));
    if (!done) break;
    streak++;
    cur.setDate(cur.getDate() - 1);
  }
  return streak;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const AVATAR_COLORS = [
  "bg-orange-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-violet-500",
  "bg-teal-500",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-pink-500",
];

function avatarColor(userId: string) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default async function LeaderboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: profiles } = await supabase
    .from("public_profiles")
    .select("user_id, display_name, avatar_url")
    .eq("show_on_leaderboard", true);

  let entries: LeaderboardEntry[] = [];

  if (profiles && profiles.length > 0) {
    const userIds = profiles.map((p) => p.user_id);

    const { data: pledges } = await supabase
      .from("accountability_pledges")
      .select("id, user_id, title, penalty")
      .in("user_id", userIds)
      .eq("is_active", true);

    const since = new Date();
    since.setDate(since.getDate() - 90);

    const { data: checkins } = await supabase
      .from("accountability_checkins")
      .select("pledge_id, user_id, date")
      .in("user_id", userIds)
      .gte("date", since.toISOString().split("T")[0]);

    entries = profiles
      .map((profile) => {
        const userPledges = (pledges ?? []).filter(
          (p) => p.user_id === profile.user_id
        );
        const userCheckins = (checkins ?? []).filter(
          (c) => c.user_id === profile.user_id
        );
        const pledgeIds = userPledges.map((p) => p.id);
        return {
          profile,
          pledges: userPledges,
          streak: calculateStreak(userCheckins, pledgeIds),
          totalCheckins: userCheckins.length,
        };
      })
      .filter((e) => e.pledges.length > 0)
      .sort((a, b) =>
        b.streak !== a.streak
          ? b.streak - a.streak
          : b.totalCheckins - a.totalCheckins
      );
  }

  const totalPledges = entries.reduce((s, e) => s + e.pledges.length, 0);
  return (
    <main className="min-h-screen bg-[#fffcf9] font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm shadow-slate-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl overflow-hidden border border-brand-orange-100/60 p-1">
              <img
                src="/graphics/logo.png"
                alt="Trackable"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-black text-slate-800 tracking-tighter text-lg">
              Trackable
            </span>
            <div className="hidden sm:flex items-center gap-1.5 ml-3 px-2.5 py-1 rounded-full bg-brand-orange-50 border border-brand-orange-100">
              <ShieldCheckIcon size={11} className="text-brand-orange-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-orange-500">
                Accountability Board
              </span>
            </div>
          </div>

          <Link
            href="/login"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-orange-500 text-white text-xs font-black uppercase tracking-widest hover:bg-brand-orange-600 transition-all shadow-lg shadow-brand-orange-200 hover:-translate-y-px active:scale-95"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-orange-50 border border-brand-orange-100 mb-8">
          <FlameIcon size={13} className="text-brand-orange-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-orange-600">
            Public &amp; Transparent
          </span>
        </div>

        <h1 className="text-[clamp(40px,7vw,80px)] font-black text-slate-900 leading-[0.9] tracking-tighter mb-6">
          Who&apos;s keeping
          <br />
          <span className="text-brand-orange-500">their word</span> today?
        </h1>

        <p className="text-slate-500 text-lg max-w-xl mx-auto mb-12 leading-relaxed">
          Real people. Real commitments. Real consequences if they skip.
          Accountability through radical transparency.
        </p>

        {/* Stats */}
        {entries.length > 0 && (
          <div className="inline-flex items-center gap-8 px-8 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm shadow-slate-50">
            <div className="text-center">
              <p className="text-2xl font-black text-slate-900">
                {entries.length}
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
                People
              </p>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="text-center">
              <p className="text-2xl font-black text-slate-900">
                {totalPledges}
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
                Active Pledges
              </p>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="text-center">
              <p className="text-2xl font-black text-brand-orange-500">
                {Math.max(...entries.map((e) => e.streak), 0)}
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
                Top Streak
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Leaderboard */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        {entries.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-brand-orange-50 flex items-center justify-center mx-auto mb-6">
              <TrophyIcon size={28} className="text-brand-orange-400" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tighter mb-3">
              No pledges yet
            </h2>
            <p className="text-slate-400 text-sm mb-8 max-w-xs mx-auto">
              Be the first to make a public commitment and start your streak.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-orange-500 text-white text-xs font-black uppercase tracking-widest hover:bg-brand-orange-600 transition-all shadow-lg shadow-brand-orange-200"
            >
              Join the Board
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <EntryCard
                key={entry.profile.user_id}
                entry={entry}
                rank={index + 1}
              />
            ))}
          </div>
        )}
      </section>

      {/* Footer CTA */}
      <section className="bg-[#2D2926] py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-[clamp(32px,5vw,56px)] font-black text-white tracking-tighter leading-tight mb-4">
            Ready to be held
            <br />
            <span className="text-brand-orange-500">accountable?</span>
          </h2>
          <p className="text-white/40 mb-10 text-sm">
            Set your commitments, define your penalty, and let the world watch.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-brand-orange-500 text-white font-black text-sm uppercase tracking-widest hover:bg-brand-orange-600 transition-all shadow-2xl shadow-brand-orange-500/30 hover:-translate-y-1 active:scale-95"
          >
            Start Your Streak
          </Link>
        </div>
      </section>
    </main>
  );
}

function EntryCard({
  entry,
  rank,
}: {
  entry: LeaderboardEntry;
  rank: number;
}) {
  const { profile, pledges, streak, totalCheckins } = entry;
  const color = avatarColor(profile.user_id);
  const initials = getInitials(profile.display_name);
  const isTop3 = rank <= 3;

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm transition-shadow hover:shadow-md overflow-hidden ${
        isTop3 ? "border-brand-orange-100" : "border-slate-100"
      }`}
    >
      <div className="flex items-start gap-5 p-6">
        {/* Rank */}
        <div
          className={`text-3xl font-black w-10 shrink-0 leading-none pt-1 ${
            rank === 1
              ? "text-brand-orange-500"
              : rank === 2
              ? "text-slate-400"
              : rank === 3
              ? "text-amber-600"
              : "text-slate-200"
          }`}
        >
          {rank}
        </div>

        {/* Avatar */}
        <div
          className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white font-black text-base shrink-0 shadow-sm`}
        >
          {initials}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <h3 className="font-black text-slate-900 text-lg tracking-tight">
              {profile.display_name}
            </h3>

            {streak > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-orange-50 border border-brand-orange-100">
                <FlameIcon size={12} className="text-brand-orange-500" />
                <span className="text-[11px] font-black text-brand-orange-600">
                  {streak} day streak
                </span>
              </div>
            )}

            {totalCheckins > 0 && streak === 0 && (
              <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">
                {totalCheckins} check-ins total
              </span>
            )}
          </div>

          {/* Pledges */}
          <div className="space-y-2">
            {pledges.map((pledge) => (
              <div key={pledge.id} className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-brand-orange-400 mt-2 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-slate-800 text-sm">
                    {pledge.title}
                  </span>
                  <span className="text-slate-400 text-sm">
                    {" "}
                    —{" "}
                    <span className="text-rose-500 font-semibold">
                      {pledge.penalty}
                    </span>{" "}
                    if skipped
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orange top bar for top 3 */}
      {isTop3 && (
        <div
          className={`h-1 w-full ${
            rank === 1
              ? "bg-brand-orange-500"
              : rank === 2
              ? "bg-slate-300"
              : "bg-amber-500"
          }`}
          style={{ order: -1, position: "absolute", top: 0, left: 0 }}
        />
      )}
    </div>
  );
}
