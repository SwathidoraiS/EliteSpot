import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
/* ---------- Types ---------- */

type User = {
  user_id: number;
  Emp_id: string;
  first_name: string;
  last_name: string;
  Email: string;
  is_active: number;
};

type FormDataType = {
  Emp_id: string;
  first_name: string;
  last_name: string;
  Email: string;
  is_active: number;
};

/* ---------- Component ---------- */

const AdminPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState<boolean>(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);

  const [formData, setFormData] = useState<FormDataType>({
    Emp_id: "",
    first_name: "",
    last_name: "",
    Email: "",
    is_active: 1
  });

  /* ---------- Fetch Users ---------- */

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users");
      const data: User[] = await response.json();
      setUsers(data);
    } catch (err) {
      setError("Unable to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ---------- Input Change ---------- */

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.name === "is_active"
          ? Number(e.target.value)
          : e.target.value
    });
  };

  /* ---------- Add / Update ---------- */

  const handleSubmit = async () => {
    try {
      if (editUserId !== null) {
        await fetch(
          `http://localhost:5000/api/users/${editUserId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
          }
        );
      } else {
        await fetch("http://localhost:5000/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
      }

      setShowForm(false);
      setEditUserId(null);
      setFormData({
        Emp_id: "",
        first_name: "",
        last_name: "",
        Email: "",
        is_active: 1
      });

      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  /* ---------- Soft Delete ---------- */

  const handleDelete = async (id: number) => {
    await fetch(`http://localhost:5000/api/users/${id}`, {
      method: "DELETE"
    });

    fetchUsers();
  };

  /* ---------- Edit ---------- */

  const handleEdit = (user: User) => {
    setFormData({
      Emp_id: user.Emp_id,
      first_name: user.first_name,
      last_name: user.last_name,
      Email: user.Email,
      is_active: user.is_active
    });

    setEditUserId(user.user_id);
    setShowForm(true);
  };

  if (loading) return <p style={{ padding: 20 }}>Loading users...</p>;
  if (error) return <p style={{ padding: 20, color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: 30 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20
        }}
      >
        <h2>Admin Panel - Users List</h2>

        <button
          onClick={() => {
            setShowForm(true);
            setEditUserId(null);
          }}
          style={{
            height: 32,
            padding: "0 10px",
            fontSize: 14,
            borderRadius: 4,
            background: "#05242bac",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            alignSelf: "center"
          }}
        >
          + Add User
        </button>
      </div>

      {showForm && (
  <div
    style={{
      background: "#ffffff",
      padding: 20,
      borderRadius: 12,
      boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
      marginBottom: 20,
      display: "flex",
      alignItems: "center",
      gap: 15,
      flexWrap: "nowrap"   // 👈 forces single line
    }}
  >
    <input
      name="Emp_id"
      placeholder="Employee ID"
      value={formData.Emp_id}
      onChange={handleChange}
      style={inputStyle}
    />

    <input
      name="first_name"
      placeholder="First Name"
      value={formData.first_name}
      onChange={handleChange}
      style={inputStyle}
    />

    <input
      name="last_name"
      placeholder="Last Name"
      value={formData.last_name}
      onChange={handleChange}
      style={inputStyle}
    />

    <input
      name="Email"
      placeholder="Email Address"
      value={formData.Email}
      onChange={handleChange}
      style={inputStyle}
    />

    <select
      name="is_active"
      value={formData.is_active}
      onChange={handleChange}
      style={inputStyle}
    >
      <option value={1}>Active</option>
      <option value={0}>Inactive</option>
    </select>

    <button onClick={handleSubmit} style={primaryBtn}>
      {editUserId !== null ? "Update" : "Save"}
    </button>

    <button
      onClick={() => {
        setShowForm(false);
        setEditUserId(null);
      }}
      style={secondaryBtn}
    >
      Cancel
    </button>
  </div>
)}
      <table style={tableStyle}>
        <thead style={{ background: "#f4f6f8" }}>
          <tr>
            <th style={thStyle}>Emp ID</th>
            <th style={thStyle}>First Name</th>
            <th style={thStyle}>Last Name</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.user_id}>
              <td style={tdStyle}>{user.Emp_id}</td>
              <td style={tdStyle}>{user.first_name}</td>
              <td style={tdStyle}>{user.last_name}</td>
              <td style={tdStyle}>{user.Email}</td>
              <td style={tdStyle}>
                {user.is_active ? "Active" : "Inactive"}
              </td>
              <td style={tdStyle}>
                <button
                  onClick={() => handleEdit(user)}
                  style={editBtn}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(user.user_id)}
                  style={deleteBtn}
                >
                  Deactivate
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ---------- Styles ---------- */

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#fff",
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
};

const thStyle: React.CSSProperties = {
  padding: 12,
  borderBottom: "1px solid #ddd",
  textAlign: "left"
};

const tdStyle: React.CSSProperties = {
  padding: 12,
  borderBottom: "1px solid #eee"
};





const inputStyle: React.CSSProperties = {
  height: 40,              // 👈 increased height
  padding: "0 10px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  width: 150,              // 👈 reduced width
  fontSize: 14
};

const primaryBtn: React.CSSProperties = {
  height: 40,              // 👈 same height as inputs
  padding: "0 18px",
  background: "#0dab4c",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 500
};

const secondaryBtn: React.CSSProperties = {
  height: 40,              // 👈 same height
  padding: "0 18px",
  background: "#9ca3af",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 500
};

const editBtn: React.CSSProperties = {
  marginRight: 6,
  padding: "6px 10px",
  background: "#f59f0ba4",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer"
};

const deleteBtn: React.CSSProperties = {
  padding: "6px 10px",
  background: "#ef4444a1",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer"
};

const formBox: React.CSSProperties = {
  display: "flex",
  gap: 10,
  marginBottom: 20,
  flexWrap: "wrap"
};

export default AdminPage;