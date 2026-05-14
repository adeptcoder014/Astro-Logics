"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";

type Tab = "users" | "charts" | "stories";

export default function AdminPage() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<Tab>("users");
  const [query, setQuery] = useState("");
  const [selectedChartId, setSelectedChartId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editingChart, setEditingChart] = useState<any | null>(null);

  const isAdminQuery = api.admin.checkIsAdmin.useQuery();

  const usersQuery = api.admin.listUsers.useQuery(undefined, { enabled: !!isAdminQuery.data?.isAdmin });
  const chartsQuery = api.admin.getAllNativityCharts.useQuery(undefined, { enabled: !!isAdminQuery.data?.isAdmin });
  const storiesQuery = api.admin.listCurrentStories.useQuery(undefined, { enabled: !!isAdminQuery.data?.isAdmin });

  const getChartAdmin = api.admin.getNativityChartAdmin.useQuery({ id: selectedChartId ?? "" }, { enabled: !!selectedChartId });

  const deleteUser = api.admin.deleteUser.useMutation({ onSuccess: () => usersQuery.refetch() });
  const deleteChart = api.admin.deleteNativityChartAdmin.useMutation({ onSuccess: () => chartsQuery.refetch() });
  const deleteStory = api.admin.deleteCurrentStory.useMutation({ onSuccess: () => storiesQuery.refetch() });
  const updateUser = api.admin.updateUser.useMutation({ onSuccess: () => { usersQuery.refetch(); setEditingUser(null); } });
  const updateChart = api.admin.updateNativityChartAdmin.useMutation({ onSuccess: () => { chartsQuery.refetch(); getChartAdmin.refetch(); setEditingChart(null); } });

  if (!session) return <div className="p-6">Sign in to access admin panel.</div>;
  if (isAdminQuery.isLoading) return <div className="p-6">Checking admin...</div>;
  if (!isAdminQuery.data?.isAdmin) return <div className="p-6">You are not authorized to view this page.</div>;

  const filteredUsers = (usersQuery.data || []).filter((u: any) => (u.name || "").toLowerCase().includes(query.toLowerCase()) || (u.email || "").toLowerCase().includes(query.toLowerCase()));
  const filteredCharts = (chartsQuery.data || []).filter((c: any) => (c.name || "").toLowerCase().includes(query.toLowerCase()) || (c.locationName || "").toLowerCase().includes(query.toLowerCase()));
  const filteredStories = (storiesQuery.data || []).filter((s: any) => (s.nativityChart?.name || "").toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="p-6 bg-gradient-to-b from-blue-50 via-purple-50 to-rose-50 min-h-screen">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-700">Admin Panel</h1>
        <div className="flex gap-2">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className="px-3 py-1 rounded border border-rose-200 bg-white text-gray-700 placeholder-gray-400" />
          <div className="text-sm text-gray-600">{session.user?.email}</div>
        </div>
      </header>

      <nav className="flex gap-3 mb-6">
        <button onClick={() => setTab("users")} className={`px-3 py-1 rounded transition ${tab === "users" ? "bg-purple-400 text-white" : "bg-white text-gray-700 border border-rose-200"}`}>Users</button>
        <button onClick={() => setTab("charts")} className={`px-3 py-1 rounded transition ${tab === "charts" ? "bg-purple-400 text-white" : "bg-white text-gray-700 border border-rose-200"}`}>Charts</button>
        <button onClick={() => setTab("stories")} className={`px-3 py-1 rounded transition ${tab === "stories" ? "bg-purple-400 text-white" : "bg-white text-gray-700 border border-rose-200"}`}>Stories</button>
      </nav>

      <main>
        {tab === "users" && (
          <section>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Users ({filteredUsers.length})</h2>
            {usersQuery.isLoading ? <div className="text-gray-600">Loading users...</div> : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredUsers.map((u: any) => (
                  <div key={u.id} className="p-3 border border-rose-200 rounded bg-white flex items-center justify-between shadow-sm">
                    <div>
                      <div className="font-medium text-gray-700">{u.name || '—'}</div>
                      <div className="text-sm text-gray-600">{u.email || u.mobile}</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-2 py-1 bg-amber-400 text-white rounded text-sm transition hover:bg-amber-500" onClick={() => setEditingUser(u)}>Edit</button>
                      <button className="px-2 py-1 bg-rose-400 text-white rounded text-sm transition hover:bg-rose-500" onClick={() => { if (!confirm('Delete user?')) return; deleteUser.mutate({ id: u.id }); }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {editingUser && (
              <form onSubmit={(e) => { e.preventDefault(); updateUser.mutate({ id: editingUser.id, name: editingUser.name, email: editingUser.email, mobile: editingUser.mobile }); }} className="mt-4 p-4 border border-rose-200 rounded bg-white/80">
                <h3 className="font-semibold text-gray-700 mb-2">Edit user</h3>
                <input className="w-full p-2 mb-2 border border-rose-200 rounded bg-white text-gray-700" value={editingUser.name || ""} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} />
                <input className="w-full p-2 mb-2 border border-rose-200 rounded bg-white text-gray-700" value={editingUser.email || ""} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} />
                <input className="w-full p-2 mb-2 border border-rose-200 rounded bg-white text-gray-700" value={editingUser.mobile || ""} onChange={(e) => setEditingUser({ ...editingUser, mobile: e.target.value })} />
                <div className="flex gap-2">
                  <button type="submit" className="px-3 py-1 bg-green-400 text-white rounded transition hover:bg-green-500">Save</button>
                  <button type="button" className="px-3 py-1 bg-gray-400 text-white rounded transition hover:bg-gray-500" onClick={() => setEditingUser(null)}>Cancel</button>
                </div>
              </form>
            )}
          </section>
        )}

        {tab === "charts" && (
          <section>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Charts ({filteredCharts.length})</h2>
            {chartsQuery.isLoading ? <div className="text-gray-600">Loading charts...</div> : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredCharts.map((c: any) => (
                  <div key={c.id} className="p-3 border border-rose-200 rounded bg-white flex items-center justify-between shadow-sm">
                    <div>
                      <div className="font-medium text-gray-700">{c.name}</div>
                      <div className="text-sm text-gray-600">{c.locationName || '—'} • {new Date(c.birthDateTime).toLocaleString()}</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-2 py-1 bg-blue-400 text-white rounded text-sm transition hover:bg-blue-500" onClick={() => { setSelectedChartId(c.id); }} >View</button>
                      <button className="px-2 py-1 bg-amber-400 text-white rounded text-sm transition hover:bg-amber-500" onClick={() => { setEditingChart(c); setSelectedChartId(c.id); }}>Edit</button>
                      <button className="px-2 py-1 bg-rose-400 text-white rounded text-sm transition hover:bg-rose-500" onClick={() => { if (!confirm('Delete chart?')) return; deleteChart.mutate({ id: c.id }); }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedChartId && getChartAdmin.data && (
              <div className="mt-4 p-4 border border-rose-200 rounded bg-white/80">
                <h3 className="font-semibold text-gray-700">Chart Details</h3>
                <div className="text-sm text-gray-600">{getChartAdmin.data.name} — {getChartAdmin.data.locationName}</div>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="p-2 border border-rose-200 rounded bg-purple-50">
                    <div className="font-medium text-gray-700">Planets</div>
                    <ul className="text-sm mt-2 max-h-48 overflow-auto text-gray-600">
                      {(getChartAdmin.data.ephemerisData?.planets || []).map((p: any) => (
                        <li key={p.id}>{p.planet} — {p.longitude.toFixed(2)}° • {p.direction}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-2 border border-rose-200 rounded bg-rose-50">
                    <div className="font-medium text-gray-700">Planetary Profiles</div>
                    <ul className="text-sm mt-2 max-h-48 overflow-auto text-gray-600">
                      {(getChartAdmin.data.planetaryProfiles || []).map((pp: any) => (
                        <li key={pp.id}>{pp.planet} — {pp.primaryDomain} ({pp.strength})</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {editingChart && (
              <form onSubmit={(e) => { e.preventDefault(); updateChart.mutate({ id: editingChart.id, name: editingChart.name, description: editingChart.description, locationName: editingChart.locationName }); }} className="mt-4 p-4 border border-rose-200 rounded bg-white/80">
                <h3 className="font-semibold text-gray-700 mb-2">Edit chart</h3>
                <input className="w-full p-2 mb-2 border border-rose-200 rounded bg-white text-gray-700" value={editingChart.name || ""} onChange={(e) => setEditingChart({ ...editingChart, name: e.target.value })} />
                <input className="w-full p-2 mb-2 border border-rose-200 rounded bg-white text-gray-700" value={editingChart.locationName || ""} onChange={(e) => setEditingChart({ ...editingChart, locationName: e.target.value })} />
                <textarea className="w-full p-2 mb-2 border border-rose-200 rounded bg-white text-gray-700" value={editingChart.description || ""} onChange={(e) => setEditingChart({ ...editingChart, description: e.target.value })} />
                <div className="flex gap-2">
                  <button type="submit" className="px-3 py-1 bg-green-400 text-white rounded transition hover:bg-green-500">Save</button>
                  <button type="button" className="px-3 py-1 bg-gray-400 text-white rounded transition hover:bg-gray-500" onClick={() => setEditingChart(null)}>Cancel</button>
                </div>
              </form>
            )}
          </section>
        )}

        {tab === "stories" && (
          <section>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Current Stories ({filteredStories.length})</h2>
            {storiesQuery.isLoading ? <div className="text-gray-600">Loading stories...</div> : (
              <div className="grid grid-cols-1 gap-3">
                {filteredStories.map((s: any) => (
                  <div key={s.id} className="p-3 border border-rose-200 rounded bg-white shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-gray-700">{s.nativityChart?.name || '—'}</div>
                        <div className="text-sm text-gray-600">{new Date(s.transitDate).toLocaleString()}</div>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-2 py-1 bg-blue-400 text-white rounded text-sm transition hover:bg-blue-500" onClick={() => { alert(s.mainNarrative || '—'); }}>View</button>
                        <button className="px-2 py-1 bg-rose-400 text-white rounded text-sm transition hover:bg-rose-500" onClick={() => { if (!confirm('Delete story?')) return; deleteStory.mutate({ id: s.id }); }}>Delete</button>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600 max-h-40 overflow-auto">{s.mainNarrative?.slice(0, 800) || '—'}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
