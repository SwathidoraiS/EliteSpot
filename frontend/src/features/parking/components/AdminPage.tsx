import { useEffect, useState, useRef } from "react";
import type { ChangeEvent } from "react";
import { FiArrowLeft, FiMoreHorizontal, FiSearch, FiPlus } from "react-icons/fi";
import Swal from "sweetalert2";
/* ---------- Types ---------- */

type User = {
  user_id: number;
  Emp_id: string;
  first_name: string;
  last_name: string;
  Email: string;
  dob: string;
  is_active: number;
  car_plate: string;
  role: string;
};

type FormDataType = {
  Emp_id: string;
  first_name: string;
  last_name: string;
  Email: string;
  dob: string;
  is_active: number;
  car_plate: string;
  role: string;
};

const AdminPage = () => {

const [users,setUsers]=useState<User[]>([]);
const menuRef = useRef<HTMLDivElement>(null);
const [loading,setLoading]=useState(true);
const [error,setError]=useState<string|null>(null);
const [openMenuId,setOpenMenuId]=useState<number|null>(null);
const [showForm,setShowForm]=useState(false);
const [editUserId,setEditUserId]=useState<number|null>(null);
const [searchTerm,setSearchTerm]=useState("");
const [currentPage,setCurrentPage] = useState(1);
const [usersPerPage, setUsersPerPage] = useState(8);
const [downloading, setDownloading] = useState(false);
const [uploading, setUploading] = useState(false);
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const fileInputRef = useRef<HTMLInputElement | null>(null);
const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
  if (!e.target.files || !e.target.files[0]) return;

  const file = e.target.files[0];

  try {
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("http://localhost:5000/api/admin/upload-users", {
      method: "POST",
      body: formData
    });
    console.log("Response received");

    const data = await response.json();

    console.log("DATA 👉", data);

   Swal.fire({
  icon: "success",
  title: "Upload Completed",
  text: `Inserted: ${data.inserted}, Skipped: ${data.skipped}`,
  confirmButtonColor: "#0dab4c"
});

    fetchUsers();

  } catch (error) {
    console.error(error);
    alert("Upload failed");
  } finally {
    setUploading(false);
  }
};
const handleUpload = async () => {
  if (!selectedFile) {
    alert("Please select a file first");
    return;
  }

  try {
    setUploading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    const response = await fetch("http://localhost:5000/api/admin/upload-users", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    alert(data.message || "Upload success");

    // refresh users list
    fetchUsers();

    setSelectedFile(null);

  } catch (error) {
    console.error(error);
    alert("Upload failed");
  } finally {
    setUploading(false);
  }
};
const [formData,setFormData]=useState<FormDataType>({
Emp_id:"",
first_name:"",
last_name:"",
Email:"",
dob:"",
is_active:1,
car_plate:"",
role:"user"
});

const handleDownloadTemplate = async () => {
  try {
    setDownloading(true);

    const response = await fetch("http://localhost:5000/api/admin/download-template");

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "user_template.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed", error);
    alert("Failed to download template");
  } finally {
    setDownloading(false);
  }
};

const [isMobile,setIsMobile]=useState(false);
useEffect(() => {

  const handleClickOutside = (event: MouseEvent) => {

    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setOpenMenuId(null);
    }

  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };

}, []);
useEffect(()=>{

const checkScreen=()=>{
setIsMobile(window.innerWidth<=768);
};

checkScreen();
window.addEventListener("resize",checkScreen);

return()=>window.removeEventListener("resize",checkScreen);

},[]);

useEffect(() => {

  const role = localStorage.getItem("userRole");

  if (role !== "admin") {
    Swal.fire({
      icon: "error",
      title: "Access Denied",
      text: "You are not authorized to access this page."
    }).then(() => {
      window.location.href = "/dashboard";
    });

  }

}, []);

useEffect(()=>{

const calculateUsersPerPage = () => {

const screenHeight = window.innerHeight;

if(isMobile){

const rows = Math.floor((screenHeight - 350) / 140);
setUsersPerPage(rows > 2 ? rows : 3);

}else{

const rows = Math.floor((screenHeight - 350) / 60);
setUsersPerPage(rows > 5 ? rows : 6);

}

};

calculateUsersPerPage();
window.addEventListener("resize",calculateUsersPerPage);

return ()=>window.removeEventListener("resize",calculateUsersPerPage);

},[isMobile]);

/* ---------- Fetch Users ---------- */

const fetchUsers=async()=>{

try{

const token = localStorage.getItem("token");

const response = await fetch("http://localhost:5000/api/users", {
  headers: {
    "Authorization": `Bearer ${token}`
  }
});

const data:User[]=await response.json();
setUsers(data);

}catch{

setError("Unable to load users");

}finally{

setLoading(false);

}

};

useEffect(()=>{
fetchUsers();
},[]);

/* ---------- Input Change ---------- */

const handleChange = (e) => {

  const { name, value } = e.target;

  if (name === "car_plate") {

    const regex = /^[A-Za-z0-9\u3040-\u30FF\u4E00-\u9FFF\s-]*$/;

    if (!regex.test(value)) return;
  }

  setFormData({
    ...formData,
    [name]:
      name === "is_active"
        ? Number(value)
        : value
  });
};

/* ---------- Add / Update ---------- */

const handleSubmit=async()=>{

  const token = localStorage.getItem("token"); 
if (
    !formData.Emp_id.trim() ||
    !formData.first_name.trim() ||
    !formData.last_name.trim() ||
    !formData.Email.trim() ||
    !formData.dob.trim()

  ) {
    alert("Please fill all fields before saving.");
    return;
  }
try{

if(editUserId!==null){

await fetch(`http://localhost:5000/api/users/${editUserId}`,{
  method:"PUT",
  headers:{
    "Content-Type":"application/json",
    "Authorization": `Bearer ${token}`
  },
  body:JSON.stringify(formData)
});

Swal.fire({
  icon: "success",
  title: "User Updated Successfully",
  confirmButtonColor: "#0dab4c"
});

}else{

await fetch("http://localhost:5000/api/users", {
  method:"POST",
  headers:{
    "Content-Type":"application/json",
    "Authorization": `Bearer ${token}`
  },
  body:JSON.stringify(formData)
});

Swal.fire({
  icon: "success",
  title: "User Added Successfully",
  text: "The new user has been created.",
  confirmButtonColor: "#0dab4c"
});


}

setShowForm(false);
setEditUserId(null);

setFormData({
Emp_id:"",
first_name:"",
last_name:"",
Email:"",
dob:"",
is_active:1,
car_plate:"",
role:"user"
});

fetchUsers();

}catch(error){

console.error("Save failed",error);

}

};

/* ---------- Delete ---------- */

const handleDelete = async (id:number) => {

  const token = localStorage.getItem("token");

  const result = await Swal.fire({
    title: "Are you sure?",
    text: "This user will be deactivated!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel"
  });

  if (!result.isConfirmed) return;

  try {

    await fetch(`http://localhost:5000/api/users/${id}`,{
      method:"DELETE",
      headers:{
        "Authorization": `Bearer ${token}`
      }
    });

    Swal.fire({
      icon: "success",
      title: "Deleted!",
      text: "User has been removed.",
      confirmButtonColor: "#0dab4c"
    });

    fetchUsers();

  } catch (error) {

    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to delete user"
    });

  }

};

/* ---------- Edit ---------- */

const handleEdit=(user:User)=>{

setFormData({
Emp_id:user.Emp_id,
first_name:user.first_name,
last_name:user.last_name,
Email:user.Email,
dob:user.dob,
is_active:user.is_active,
car_plate:user.car_plate,
role:user.role
});

setEditUserId(user.user_id);
setShowForm(true);

};

if(loading) return <p style={{padding:20}}>Loading users...</p>;
if(error) return <p style={{padding:20,color:"red"}}>{error}</p>;

const filteredUsers=users.filter(user=>{

const search=searchTerm.toLowerCase();

return(
user.first_name.toLowerCase().includes(search) ||
user.last_name.toLowerCase().includes(search) ||
user.Emp_id.toLowerCase().includes(search) ||
user.Email.toLowerCase().includes(search)
);

});
const indexOfLastUser = currentPage * usersPerPage;
const indexOfFirstUser = indexOfLastUser - usersPerPage;

const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

return(

<div style={{padding:30}}>

{/* Header */}

<div
style={{
display:"flex",
flexDirection:isMobile?"column":"row",
justifyContent:"space-between",
alignItems:isMobile?"flex-start":"center",
marginBottom:10
}}
>

<div style={{display:"flex",alignItems:"center",gap:10}}>
<FiArrowLeft
size={22}
style={{cursor:"pointer"}}
onClick={() => window.history.back()}
/>
<h2 style={{margin:0}}>User Management</h2>

</div>
<div
  style={{
    display: "flex",
    gap: 10,
    alignItems: "center",
    marginTop: isMobile ? 10 : 0
  }}
>

  {/* Download */}
  <button
    onClick={handleDownloadTemplate}
    disabled={downloading}
    style={{
      height: 36,
      padding: "0 14px",
      fontSize: 14,
      borderRadius: 8,
      background: downloading ? "#94a3b8" : "#5fa5cb",
      color: "#fff",
      border: "none",
      cursor: downloading ? "not-allowed" : "pointer"
    }}
  >
    {downloading ? "Downloading..." : "Download Template"}
  </button>

  {/* Upload */}
  <>
    <input
      type="file"
      accept=".xlsx"
      ref={fileInputRef}
      style={{ display: "none" }}
      onChange={handleFileChange}
    />

    <button
      onClick={() => fileInputRef.current?.click()}
      disabled={uploading}
      style={{
        height: 36,
        padding: "0 14px",
        borderRadius: 8,
        background: uploading ? "#94a3b8" : "#0dab4c",
        color: "#fff",
        border: "none",
        cursor: uploading ? "not-allowed" : "pointer"
      }}
    >
      {uploading ? "Uploading..." : "Upload Excel"}
    </button>
  </>

  {/* Add User */}
  <button
    onClick={() => {
      setShowForm(true);
      setEditUserId(null);
    }}
    style={{
      height: 36,
      padding: "0 14px",
      fontSize: 14,
      borderRadius: 8,
      background: "#05242bac",
      color: "#fff",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 5
    }}
  >
    <FiPlus /> Add New User
  </button>

</div>

</div>

{/* Search */}

<div
style={{
background:"#fff",
padding:10,
borderRadius:12,
boxShadow:"0 6px 18px rgba(0,0,0,0.08)",
marginBottom:10
}}
>

<div style={{position:"relative",width:isMobile?"100%":320}}>

<FiSearch style={{position:"absolute",left:10,top:12,color:"#888"}}/>

<input
type="text"
placeholder="Search by Name, Employee ID, Email"
value={searchTerm}
onChange={(e)=>setSearchTerm(e.target.value)}
style={{
height:38,
width:"100%",
borderRadius:8,
border:"1px solid #d1d5db",
padding:"0 12px 0 38px",
fontSize:14
}}
/>

</div>

</div>

{/* FORM */}

{showForm && (

<div
style={{
background:"#fff",
padding:20,
borderRadius:12,
boxShadow:"0 8px 24px rgba(0,0,0,0.12)",
marginBottom:20,
display:"flex",
gap:10,
flexWrap:"wrap"
}}
>

<input name="Emp_id" placeholder="Employee ID" value={formData.Emp_id} onChange={handleChange} style={inputStyle}/>
<input name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} style={inputStyle}/>
<input name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} style={inputStyle}/>
<input name="Email" placeholder="Email" value={formData.Email} onChange={handleChange} style={inputStyle}/>
<div style={dateInputWrapper}>
  <span style={calendarIcon}>📅</span>
  <input
    type="date"
    name="dob"
    value={formData.dob}
    onChange={handleChange}
    max={new Date().toISOString().split("T")[0]}
    style={dateInput}
  />
</div>
<select name="is_active" value={formData.is_active} onChange={handleChange} style={inputStyle}>
<option value={1}>Active</option>
<option value={0}>Inactive</option>
</select>
<input
  name="car_plate"
  placeholder="Car Number Plate"
  value={formData.car_plate}
  onChange={handleChange}
  style={inputStyle}
/>

<select
  name="role"
  value={formData.role}
  onChange={handleChange}
  style={inputStyle}
>
  <option value="user">User</option>
  <option value="admin">Admin</option>
</select>

<div style={{ display: "flex", gap: 10 }}>
  <button onClick={handleSubmit} style={primaryBtn}>
    {editUserId !== null ? "Update" : "Save"}
  </button>

  <button
    onClick={() => {
      setShowForm(false);
      setEditUserId(null);
      setFormData({
        Emp_id: "",
        first_name: "",
        last_name: "",
        Email: "",
        dob:"",
        is_active: 1,
        car_plate:"",
        role:"user"
      });
    }}
    style={cancelBtn}
  >
    Cancel
  </button>
</div>

</div>

)}

{/* MOBILE VIEW */}

{isMobile ? (

currentUsers.map((user)=>{

const initials=user.first_name[0]+user.last_name[0];

return(

<div key={user.user_id} style={mobileCard}>

<div style={{display:"flex",justifyContent:"space-between"}}>

<div style={{display:"flex",gap:6, alignItems:"center"}}>

<div style={avatar}>{initials}</div>

<div>
<div>{user.first_name} {user.last_name}</div>
<div style={{fontSize:12,color:"#777"}}>{user.Emp_id}</div>
</div>

</div>

<div style={{position:"relative"}}>

<FiMoreHorizontal
size={20}
style={{cursor:"pointer"}}
onClick={()=>setOpenMenuId(openMenuId===user.user_id?null:user.user_id)}
/>

{openMenuId===user.user_id &&(

<div ref={menuRef} style={menuBox}>
<div onClick={()=>handleEdit(user)} style={menuItem}>Edit</div>
<div onClick={()=>handleDelete(user.user_id)} style={{...menuItem,color:"#ef4444"}}>Delete</div>
</div>

)}

</div>

</div>

<div style={{marginTop:8}}>{user.Email}</div>

<div style={{marginTop:8,display:"flex",gap:6}}>
<div style={{
width:8,
height:8,
borderRadius:"50%",
background:user.is_active?"#22c55e":"#ef4444",
marginTop:1
}}></div>

{user.is_active?"Active":"Inactive"}

</div>

</div>

);

})

):(

// Desktop Table

<table style={tableStyle}>

<thead style={{background:"#f4f6f8"}}>
<tr>
<th style={thStyle}>Name / Employee ID</th>
<th style={thStyle}>Email</th>
<th style={thStyle}>Status</th>
<th style={thStyle}>Actions</th>
</tr>
</thead>

<tbody>

{currentUsers.map((user)=>{

const initials=user.first_name[0]+user.last_name[0];

return(

<tr key={user.user_id}>

<td style={tdStyle}>
<div style={{display:"flex",gap:10}}>
<div style={avatar}>{initials}</div>

<div>
<div>{user.first_name} {user.last_name}</div>
<div style={{fontSize:12,color:"#777"}}>{user.Emp_id}</div>
</div>
</div>
</td>

<td style={tdStyle}>{user.Email}</td>

<td style={tdStyle}>
<div style={{display:"flex",gap:6}}>
<div style={{
width:8,
height:8,
borderRadius:"50%",
background:user.is_active?"#22c55e":"#ef4444"
}}></div>
{user.is_active?"Active":"Inactive"}
</div>
</td>

<td style={{...tdStyle,position:"relative",}}>

<FiMoreHorizontal
style={{cursor:"pointer"}}
onClick={()=>setOpenMenuId(openMenuId===user.user_id?null:user.user_id)}
/>

{openMenuId===user.user_id &&(

<div ref={menuRef} style={menuBox}>
<div onClick={()=>handleEdit(user)} style={menuItem}>Edit</div>
<div onClick={()=>handleDelete(user.user_id)} style={{...menuItem,color:"#ef4444"}}>Delete</div>
</div>

)}

</td>

</tr>

);

})}

</tbody>

</table>

)}
<div
style={{
display:"flex",
justifyContent:"center",
alignItems:"center",
gap:8,
marginTop:10
}}
>

<button
disabled={currentPage===1}
onClick={()=>setCurrentPage(currentPage-1)}
style={pageBtn}
>
{"<"}
</button>

{Array.from({length:totalPages},(_,i)=>(
<button
key={i}
onClick={()=>setCurrentPage(i+1)}
style={{
...pageBtn,
background: currentPage===i+1 ? "#e5e7eb" : "#fff"
}}
>
{i+1}
</button>
))}

<button
disabled={currentPage===totalPages}
onClick={()=>setCurrentPage(currentPage+1)}
style={pageBtn}
>
{">"}
</button>

</div>
</div>

);

};

/* ---------- Styles ---------- */

const tableStyle={width:"100%",borderCollapse:"collapse",background:"#fff",boxShadow:"0 8px 24px rgba(0,0,0,0.12)"};
const thStyle={padding:12,borderBottom:"1px solid #ddd",textAlign:"left"};
const tdStyle={padding:12,borderBottom:"1px solid #eee"};

const avatar={
width:36,
height:36,
borderRadius:"50%",
background:"#94a3b8",
color:"#fff",
display:"flex",
alignItems:"center",
justifyContent:"center"
};

const mobileCard={
background:"#fff",
padding:16,
borderRadius:12,
marginBottom:12,
boxShadow:"0 4px 12px rgba(0,0,0,0.08)"
};

const menuBox = {
  position: "absolute",
  right: 0,
  top: 24,
  background: "#fff",
  borderRadius: 8,
  boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
  zIndex: 1000
};

const menuItem={
padding:"8px 14px",
cursor:"pointer",
fontSize:14
};

const inputStyle={
height:40,
padding:"0 10px",
borderRadius:8,
border:"1px solid #d1d5db",
width:150
};

const cancelBtn = {
height:40,
padding:"0 18px",
background:"#9ca3af",
color:"#fff",
border:"none",
borderRadius:8,
cursor:"pointer"
};

const primaryBtn={
height:40,
padding:"0 18px",
background:"#0dab4c",
color:"#fff",
border:"none",
borderRadius:8,
cursor:"pointer"
};

const pageBtn={
padding:"6px 10px",
border:"1px solid #d1d5db",
background:"#fff",
cursor:"pointer",
borderRadius:4
};

const dateInputWrapper = {
  position: "relative" as const,
  display: "flex",
  alignItems: "center"
};

const calendarIcon = {
  position: "absolute" as const,
  left: "10px",
  fontSize: "14px",
  pointerEvents: "none"
};

const dateInput = {
  height: 40,
  padding: "0 10px 0 32px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  width: 150
};

export default AdminPage;