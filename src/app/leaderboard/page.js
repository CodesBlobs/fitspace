"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Award, TrendingUp, Users, Crown } from "lucide-react";
import AppShell from "@/components/AppShell";
import api from "@/lib/api";

const rankIcons = {
  1: { icon: Crown, color: "text-yellow-500", bg: "bg-yellow-500/20", label: "🥇" },
  2: { icon: Medal, color: "text-gray-400", bg: "bg-gray-400/20", label: "🥈" },
  3: { icon: Award, color: "text-amber-600", bg: "bg-amber-600/20", label: "🥉" },
};

const metricColors = {
  workouts: "from-rose-400 to-pink-500",
  meals: "from-orange-400 to-amber-500",
  water: "from-blue-400 to-cyan-500",
  sleep: "from-purple-400 to-violet-500",
  mood: "from-green-400 to-emerald-500",
};

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("weekly");

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/leaderboard?timeframe=${timeframe}`);
      setLeaderboard(response.data.leaderboard || []);
      setCurrentUser(response.data.currentUser);
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getMetricDisplay = (entry) => {
    return [
      {
        label: "Workouts",
        value: entry.totalWorkouts,
        unit: "sessions",
        gradient: metricColors.workouts,
      },
      {
        label: "Meals",
        value: entry.mealsLogged,
        unit: "logged",
        gradient: metricColors.meals,
      },
      {
        label: "Water",
        value: ((entry.waterIntake || 0) / 1000).toFixed(1),
        unit: "L",
        gradient: metricColors.water,
      },
      {
        label: "Sleep",
        value: (entry.sleepHours || 0).toFixed(1),
        unit: "hrs",
        gradient: metricColors.sleep,
      },
      {
        label: "Mood",
        value: (entry.moodScore || 0).toFixed(1),
        unit: "/5",
        gradient: metricColors.mood,
      },
    ];
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text">Leaderboard</h1>
                <p className="text-text-muted text-sm">
                  Compete with others and track your progress
                </p>
              </div>
            </div>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-4 py-2 rounded-xl bg-white/60 border border-white/40 text-sm font-medium text-text hover:bg-white/80 transition-all cursor-pointer"
            >
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
              <option value="alltime">All Time</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="glass-card p-5 animate-pulse-soft flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-lavender-light rounded-xl" />
                <div className="flex-1">
                  <div className="h-5 w-32 bg-lavender-light rounded mb-2" />
                  <div className="h-4 w-48 bg-lavender-light rounded" />
                </div>
                <div className="w-20 h-8 bg-lavender-light rounded" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Current User Standings */}
            {currentUser && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 mb-8 border-2 border-violet-400/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold ${
                        rankIcons[currentUser.rank]?.bg || "bg-violet-500/20"
                      }`}
                    >
                      {rankIcons[currentUser.rank]?.label || `#${currentUser.rank}`}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-text">Your Ranking</h3>
                      <p className="text-text-muted text-sm">
                        {currentUser.rank}
                        {currentUser.rank === 1
                          ? "st"
                          : currentUser.rank === 2
                          ? "nd"
                          : currentUser.rank === 3
                          ? "rd"
                          : "th"}{" "}
                        out of {currentUser.totalCount} participants
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
                      {currentUser.score.toFixed(0)}
                    </div>
                    <p className="text-text-muted text-xs">points</p>
                  </div>
                </div>

                {/* Mini stats */}
                <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-white/20">
                  <div className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-600 text-sm font-medium">
                    {currentUser.totalWorkouts} workouts
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-600 text-sm font-medium">
                    {currentUser.mealsLogged} meals
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 text-sm font-medium">
                    {((currentUser.waterIntake || 0) / 1000).toFixed(1)}L water
                  </div>
                </div>
              </motion.div>
            )}

            {/* Leaderboard Table */}
            <div className="glass-card overflow-hidden">
              <div className="p-4 border-b border-white/20 bg-white/30">
                <div className="flex items-center gap-2 text-text-muted text-sm font-medium uppercase tracking-wide">
                  <Users className="w-4 h-4" />
                  Top Performers
                </div>
              </div>

              <div className="divide-y divide-white/10">
                {leaderboard.map((entry, index) => {
                  const RankIcon = rankIcons[entry.rank]?.icon;
                  const isCurrentUser = entry.isCurrentUser;
                  const metrics = getMetricDisplay(entry);

                  return (
                    <motion.div
                      key={entry.user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-5 flex items-center gap-4 hover:bg-white/40 transition-all ${
                        isCurrentUser ? "bg-violet-500/10" : ""
                      }`}
                    >
                      {/* Rank */}
                      <div className="w-12 flex-shrink-0">
                        {RankIcon ? (
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              rankIcons[entry.rank].bg
                            }`}
                          >
                            <RankIcon
                              className={`w-5 h-5 ${rankIcons[entry.rank].color}`}
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-lavender-light/50 flex items-center justify-center text-text-muted font-semibold">
                            {entry.rank}
                          </div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${
                            entry.user.avatar
                              ? "bg-gradient-to-br from-violet-400 to-purple-500 text-white"
                              : "bg-lavender-light text-text"
                          }`}
                        >
                          {entry.user.avatar || entry.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4
                            className={`font-semibold ${
                              isCurrentUser ? "text-violet-600" : "text-text"
                            }`}
                          >
                            {entry.user.name}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-violet-500">(You)</span>
                            )}
                          </h4>
                          <div className="flex gap-2 mt-1">
                            {metrics.slice(0, 3).map((m, i) => (
                              <span
                                key={i}
                                className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${m.gradient} text-white font-medium`}
                              >
                                {m.value}
                                {m.unit}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <TrendingUp
                            className={`w-4 h-4 ${
                              index < 3 ? "text-green-500" : "text-text-muted"
                            }`}
                          />
                          <span className="text-xl font-bold text-text">
                            {entry.score.toFixed(0)}
                          </span>
                        </div>
                        <p className="text-text-muted text-xs">points</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Score Calculation Info */}
            <div className="mt-6 p-5 rounded-2xl bg-white/40 border border-white/30">
              <h4 className="font-semibold text-text mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-violet-500" />
                How scores are calculated
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm text-text-muted">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Workouts: 10 pts each
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  Meals: 5 pts each
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Water: 2 pts per liter
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  Sleep: 3 pts per hour
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Mood: 4 pts per energy level
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
