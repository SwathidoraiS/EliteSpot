import React, { useEffect, useState } from "react";

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editUserId, setEditUserId] = useState(null);

  const [formData, setFormData] = useState({
    Emp_id: "",
    first_name: "",
    last_name: "",
    Email: "",
    is_active: 1
  });

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users");
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Unable to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Add or Update User
  const handleSubmit = async () => {
    try {
      if (editUserId) {
        // UPDATE
        await fetch(`http://localhost:5000/api/users/${editUserId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
      } else {
        // ADD
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

  // Delete User
  const handleDelete = async (id) => {
    await fetch(`http://localhost:5000/api/users/${id}`, {
      method: "DELETE"
    });

    fetchUsers();
  };

  // Edit User
  const handleEdit = (user) => {
    setFormData(user);
    setEditUserId(user.user_id);
    setShowForm(true);
  };

  if (loading) return <p style={{ padding: "20px" }}>Loading users...</p>;
  if (error) return <p style={{ padding: "20px", color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "30px" }}>
      
      {/* Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <h2>Admin Panel - Users List</h2>

        <button
  onClick={() => {
    setShowForm(true);
    setEditUserId(null);
  }}
  style={{
    height: "32px",          // 👈 force height
    padding: "0 10px",       // horizontal only
    fontSize: "14px",
    borderRadius: "4px",
    background: "#05242bac",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    alignSelf: "center"      // 👈 prevent stretching
  }}
>
  + Add User
</button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={formBox}>
          <input name="Emp_id" placeholder="Emp ID" value={formData.Emp_id} onChange={handleChange} />
          <input name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} />
          <input name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} />
          <input name="Email" placeholder="Email" value={formData.Email} onChange={handleChange} />

          <select name="is_active" value={formData.is_active} onChange={handleChange}>
            <option value={1}>Active</option>
            <option value={0}>Inactive</option>
          </select>

          <button onClick={handleSubmit} style={saveBtn}>
            {editUserId ? "Update" : "Save"}
          </button>
        </div>
      )}

      {/* Table */}
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
              <td style={tdStyle}>{user.is_active ? "Active" : "Inactive"}</td>
              <td style={tdStyle}>
                <button onClick={() => handleEdit(user)} style={editBtn}>Edit</button>
                <button onClick={() => handleDelete(user.user_id)} style={deleteBtn}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* Styles */

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#fff",
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
};

const thStyle = {
  padding: "12px",
  borderBottom: "1px solid #ddd",
  textAlign: "left"
};

const tdStyle = {
  padding: "12px",
  borderBottom: "1px solid #eee"
};

const addBtn = {
  padding: "6px 10px",
  background: "#096378",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer"
};

const saveBtn = {
  marginTop: "10px",
  padding: "8px 14px",
  background: "#0dab4c",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};

const editBtn = {
  marginRight: "6px",
  padding: "6px 10px",
  background: "#f59f0ba4",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer"
};

const deleteBtn = {
  padding: "6px 10px",
  background: "#ef4444a1",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer"
};

const formBox = {
  display: "flex",
  gap: "10px",
  marginBottom: "20px",
  flexWrap: "wrap"
};

export default AdminPage;