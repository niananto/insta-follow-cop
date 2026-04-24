"use client";

import { useState, useMemo } from "react";
import type { IGUser } from "@/lib/instagram/types";
import { formatDate, formatNumber } from "@/lib/utils";
import { Button } from "./ui/Button";

interface UserTableProps {
  users: IGUser[];
  emptyMessage?: string;
}

type SortKey = "username" | "followedAt";
type SortDir = "asc" | "desc";

export function UserTable({
  users,
  emptyMessage = "No users found.",
}: UserTableProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("username");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => u.username.toLowerCase().includes(q));
  }, [users, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "username") {
        cmp = a.username.localeCompare(b.username);
      } else {
        cmp = a.followedAt.getTime() - b.followedAt.getTime();
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const copyAll = () => {
    const text = sorted.map((u) => u.username).join("\n");
    navigator.clipboard.writeText(text);
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      <span className="ml-1 text-pink-400">{sortDir === "asc" ? "↑" : "↓"}</span>
    ) : (
      <span className="ml-1 text-gray-600">↕</span>
    );

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <div className="text-4xl mb-3">🎉</div>
        <p className="text-lg font-medium text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search usernames…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
        />
        <Button variant="secondary" size="sm" onClick={copyAll}>
          Copy all ({formatNumber(sorted.length)})
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => toggleSort("username")}
                  className="font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Username <SortIcon k="username" />
                </button>
              </th>
              <th className="px-4 py-3 text-right hidden sm:table-cell">
                <button
                  onClick={() => toggleSort("followedAt")}
                  className="font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Followed on <SortIcon k="followedAt" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sorted.map((user) => (
              <tr
                key={user.username}
                className="hover:bg-white/[0.03] transition-colors"
              >
                <td className="px-4 py-3">
                  <a
                    href={user.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-white hover:text-pink-400 transition-colors"
                  >
                    @{user.username}
                  </a>
                </td>
                <td className="px-4 py-3 text-right text-gray-500 hidden sm:table-cell">
                  {formatDate(user.followedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && search && (
        <p className="text-center text-sm text-gray-500 py-4">
          No results for &quot;{search}&quot;
        </p>
      )}
    </div>
  );
}
