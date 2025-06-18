import { useEffect, useState } from "react";
import { getAllUsers, deleteUser, getAdminStats } from "../services/adminService";
import { User } from "../types/user";
import AdminRecipesTable from "../components/AdminRecipesTable";

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<null | {
    user_count: number;
    recipe_count: number;
    top_rated_recipe: string;
    most_favorited_recipe: string;
  }>(null);

  useEffect(() => {
    getAllUsers().then(setUsers).catch(() => setUsers([]));
    getAdminStats().then(setStats).catch(() => setStats(null));
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm("האם אתה בטוח שברצונך למחוק משתמש זה?")) {
      await deleteUser(id);
      setUsers(users.filter((user) => user.id !== id));
    }
  };

  return (
    <div className="p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">🔐 ניהול מערכת</h1>

      {/* כרטיסי סטטיסטיקות */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <h3 className="text-lg font-semibold mb-1">👥 מספר משתמשים</h3>
            <p className="text-2xl font-bold text-primary">{stats.user_count}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <h3 className="text-lg font-semibold mb-1">📦 מספר מתכונים</h3>
            <p className="text-2xl font-bold text-primary">{stats.recipe_count}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <h3 className="text-lg font-semibold mb-1">⭐ מתכון עם דירוג הכי גבוה</h3>
            <p className="text-lg">{stats.top_rated_recipe}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <h3 className="text-lg font-semibold mb-1">❤️ מתכון הכי מועדף</h3>
            <p className="text-lg">{stats.most_favorited_recipe}</p>
          </div>
        </div>
      )}

      {/* טבלת משתמשים */}
      <h2 className="text-xl font-bold mb-2">👥 משתמשים</h2>
      <table className="w-full border-collapse border text-right mb-10">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">#</th>
            <th className="border px-4 py-2">שם משתמש</th>
            <th className="border px-4 py-2">אימייל</th>
            <th className="border px-4 py-2">אדמין?</th>
            <th className="border px-4 py-2 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t hover:bg-gray-50">
              <td className="border px-4 py-2">{user.id}</td>
              <td className="border px-4 py-2">{user.username}</td>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2">
                {user.is_admin ? "✅" : "❌"}
              </td>
              <td className="border px-2 py-2 text-center">
                <button
                  onClick={() => handleDelete(user.id)}
                  className="text-red-600 hover:scale-110 transition-transform text-lg"
                  title="מחק משתמש"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* טבלת מתכונים */}
      <AdminRecipesTable />
    </div>
  );
}
