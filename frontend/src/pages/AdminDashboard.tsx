import { useEffect, useState } from "react";
import { getAllUsers, deleteUser } from "../services/adminService";
import { User } from "../types/user";
import AdminRecipesTable from "../components/AdminRecipesTable"; // ⬅️ חשוב!

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    getAllUsers()
      .then(setUsers)
      .catch(() => setUsers([]));
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm("האם אתה בטוח שברצונך למחוק משתמש זה?")) {
      await deleteUser(id);
      setUsers(users.filter((user) => user.id !== id));
    }
  };

  return (
    <div className="p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-4">🔐 ניהול מערכת</h1>

      {/* טבלת משתמשים */}
      <h2 className="text-xl font-bold mb-2">👥 משתמשים</h2>
      <table className="w-full border-collapse border text-right">
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
