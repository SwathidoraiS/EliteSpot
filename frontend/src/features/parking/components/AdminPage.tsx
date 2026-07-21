import { useEffect, useState, useRef } from "react";
import type { ChangeEvent } from "react";
import { FiArrowLeft, FiMoreHorizontal, FiSearch, FiPlus } from "react-icons/fi";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import UserMenu from "./UserMenu";
import { useNavigate } from "react-router-dom";
/* ================= TYPES ================= */
/**
 * User Type - represents user data from backend
 */
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

/**
 * Form Data Type - used for add/edit user form
 */
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

/* ================= COMPONENT ================= */
/**
 * AdminPage Component
 * Handles user management:
 * - View users
 * - Add / Edit / Delete users
 * - Upload Excel
 * - Download template
 */
const AdminPage = () => {
  /* ================= STATE ================= */
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ja" : "en";
    i18n.changeLanguage(newLang);

    // optional: persist language
    localStorage.setItem("lang", newLang);
  };

  //API
  const API = import.meta.env.VITE_API_BASE_URL;
  // User data
  const [users,setUsers]=useState<User[]>([]);
  // UI states
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);
  const [isMobile,setIsMobile]=useState(false);
  // Menu / modal states
  const [openMenuId,setOpenMenuId]=useState<number|null>(null);
  const [showForm,setShowForm]=useState(false);
  const [editUserId,setEditUserId]=useState<number|null>(null);
  // Filters & pagination
  const [searchTerm,setSearchTerm]=useState("");
  const [currentPage,setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(8);
  // Upload / download
  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Form state
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

  /* ================= FILE UPLOAD ================= */
  /**
   * Handle Excel file upload (bulk users)
   */
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token");

      const response = await fetch(`${API}/admin/upload-users`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}` // 🔥 ADD THIS
        },
        body: formData
      });

      const data = await response.json();

      Swal.fire({
        icon: "success",
        title: t("uploadCompleted"),
        text: `${t("inserted")}: ${data.inserted}, ${t("skipped")}: ${data.skipped}`,
        confirmButtonColor: "#0dab4c"
      });

      fetchUsers();
      } catch (error) {
        Swal.fire(t("error"), t("uploadFailed"), "error");
      } finally {
        setUploading(false);
      }
    };

      /* ================= DOWNLOAD TEMPLATE ================= */

      /**
       * Download Excel template for bulk upload
       */
      const handleDownloadTemplate = async () => {
        try {
          setDownloading(true);

          const response = await fetch(`${API}/admin/download-template`);
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
          console.error(error);
          Swal.fire(t("error"), t("downloadFailed"), "error");
        } finally {
          setDownloading(false);
        }
      };

        /* ================= EFFECTS ================= */
        /**
        * Close menu when clicking outside
        */
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
        
        /**
         * Detect mobile screen
        */
        useEffect(()=>{
          const checkScreen=()=>{
            setIsMobile(window.innerWidth<=768);
          };
          checkScreen();
          window.addEventListener("resize",checkScreen);
          return()=>window.removeEventListener("resize",checkScreen);
        },[]);
        
        /**
        * Protect route (admin only)
        */
        useEffect(() => {
          const role = localStorage.getItem("userRole");
          if (role !== "admin") {
            Swal.fire({
              icon: "error",
              title: t("accessDenied"),
              text: t("notAuthorized")
            }).then(() => {
              window.location.href = "/dashboard";
            });
          }
        }, []);

         /**
         * Dynamic pagination based on screen size
         */
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
        
        /* ================= API ================= */
        /* ---------- Fetch Users ---------- */
        const fetchUsers=async()=>{
          try{
            const token = localStorage.getItem("token");
            const response = await fetch(`${API}/users`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          const res = await response.json();
          setUsers(res.data);
          }catch{
            setError("Unable to load users");
          }finally{
            setLoading(false);
          }
          };
          useEffect(()=>{
            fetchUsers();
          },[]);

          /* ================= FORM ================= */
          /**
           * Handle form input changes
           */
          const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const { name, value } = e.target;
            
             // ✅ Allow Japanese + English for names
            if (name === "first_name" || name === "last_name") {
              const regex = /^[A-Za-z\u3040-\u30FF\u4E00-\u9FFF\s]*$/;
              if (!regex.test(value)) return;
            }

            // Allow only valid characters for car plate
            if (name === "car_plate") {
              const regex = /^[A-Za-z0-9\u3040-\u30FF\u4E00-\u9FFF\s-]*$/;
              if (!regex.test(value)) return;
            }
            setFormData({
              ...formData,
              [name]:
                name === "is_active" ? Number(value): value
            });
          };

          /**
           * Add new user OR update existing user
           */
          const handleSubmit=async()=>{
            const token = localStorage.getItem("token"); 
          if (!formData.Emp_id.trim() ||!formData.first_name.trim() ||!formData.last_name.trim() ||!formData.Email.trim() || !formData.dob.trim() || !formData.car_plate.trim() || !formData.role.trim()) {
              Swal.fire(t("warning"), t("fillAllFields"), "warning");
              return;
          }
          try {
            const url =
              editUserId !== null
                ? `${API}/users/${editUserId}`
                : `${API}/users`;

            const method = editUserId ? "PUT" : "POST";

            await fetch(url, {
              method,
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify(formData)
            });
            
            Swal.fire({
                icon: "success",
                title: t("userAdded"),
                text: t("userCreated"),
                confirmButtonColor: "#0dab4c"
              });
            setShowForm(false);
            setEditUserId(null);
            fetchUsers();
            }catch(error){
              Swal.fire("Error", "Save failed", "error");
            }
            };
            /**
            * Delete user
            */
            const handleDelete = async (id:number) => {
            const token = localStorage.getItem("token");
            const result = await Swal.fire({
              title: t("areYouSure"),
              text: t("userDeactivate"),
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#ef4444",
              cancelButtonColor: "#6b7280",
              confirmButtonText: t("yesDelete"),
              cancelButtonText: t("cancel")
            });
            if (!result.isConfirmed) return;
            try {
              await fetch(`${API}/users/${id}`,{
                method:"DELETE",
                headers:{
                  "Authorization": `Bearer ${token}`
                }
              });
              Swal.fire({
                icon: "success",
                title: t("deleted"),
                text: t("userRemoved"),
                confirmButtonColor: "#0dab4c"
              });
              fetchUsers();
            } catch (error) {
              Swal.fire({
                icon: "error",
                title: t("error"),
                text: t("deleteFailed")
              });
            }
          };

          /**
          * Edit user (load into form)
          */
          const handleEdit = (user: User) => {
  setFormData({
    ...user,
    dob: user.dob
      ? new Date(user.dob).toISOString().split("T")[0]
      : "",
  });

  setEditUserId(user.user_id);
  setShowForm(true);
};

          /* ================= RENDER ================= */
          if(loading) return <p style={{padding:20}}>Loading users...</p>;
          if(error) return <p style={{padding:20,color:"red"}}>{error}</p>;
          
          /* ---------- FILTER ---------- */
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

          /* ---------- UI ---------- */
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
                onClick={() => navigate("/")}
              />
              <h2 style={{ margin: 0 }}>{t("userManagement")}</h2>
              <button
                onClick={toggleLanguage}
                style={{
                  height: 32,
                  padding: "0 10px",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  background: "#fff",
                  cursor: "pointer"
                }}
              >
                {i18n.language === "en" ? "日本語" : "EN"}
              </button>
            </div>
            
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                marginTop: isMobile ? 10 : 0
              }}
            >
              
            {/*======== Button ==========*/}
            {/* Download Template */}
            <button
              onClick={handleDownloadTemplate}
              disabled={downloading}
              style={{
                height: 36,
                padding: "0 14px",
                fontSize: 12,
                borderRadius: 8,
                background: downloading ? "#94a3b8" : "#5fa5cb",
                color: "#fff",
                border: "none",
                cursor: downloading ? "not-allowed" : "pointer"
              }}
            >
              {downloading ? t("downloading") : t("downloadTemplate")}
            </button>

            {/* Upload Excel */}
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
                  fontSize: 12,
                  borderRadius: 8,
                  background: uploading ? "#94a3b8" : "#0dab4c",
                  color: "#fff",
                  border: "none",
                  cursor: uploading ? "not-allowed" : "pointer"
                }}
              >
                {uploading ? t("uploading") : t("uploadExcel")}
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
                fontSize: 12,
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
              <FiPlus /> {t("addUser")}
            </button>
             <UserMenu />
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
            placeholder={t("searchUsers")}
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

          <input name="Emp_id" placeholder={t("employeeId")} value={formData.Emp_id} onChange={handleChange} style={inputStyle}/>
          <input name="first_name" placeholder={t("firstName")} value={formData.first_name} onChange={handleChange} style={inputStyle}/>
          <input name="last_name" placeholder={t("lastName")} value={formData.last_name} onChange={handleChange} style={inputStyle}/>
          <input name="Email" placeholder={t("email")} value={formData.Email} onChange={handleChange} style={inputStyle}/>
         <div style={dateInputWrapper}>
            <span style={calendarIcon}>DOB</span>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              style={{
                ...inputStyle,
                paddingLeft: "40px",
              }}
            />
        </div>
          <select name="is_active" value={formData.is_active} onChange={handleChange} style={inputStyle}>
          <option value={1}>{t("active")}</option>
          <option value={0}>{t("inactive")}</option>
          </select>
          <input
            name="car_plate"
            placeholder={t("carPlate")}
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
            <option value="user">{t("user")}</option>
            <option value="admin">{t("admin")}</option>
          </select>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleSubmit} style={primaryBtn}>
              {editUserId !== null ? t("update") : t("save")}
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
              {t("cancel")}
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
          <div onClick={()=>handleEdit(user)} style={menuItem}>{t("edit")}</div>
          <div onClick={()=>handleDelete(user.user_id)} style={{...menuItem,color:"#ef4444"}}>{t("delete")}</div>
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

          {user.is_active ? t("active") : t("inactive")}
          </div>
          </div>
          );
          })
          ):(

          // Desktop Table
          <table style={tableStyle}>
          <thead style={{background:"#f4f6f8"}}>
          <tr>
            <th style={thStyle}>{t("nameEmpId")}</th>
            <th style={thStyle}>{t("email")}</th>
            <th style={thStyle}>{t("status")}</th>
            <th style={thStyle}>{t("actions")}</th>
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
            <div onClick={()=>handleEdit(user)} style={menuItem}>{t("edit")}</div>
            <div onClick={()=>handleDelete(user.user_id)} style={{...menuItem,color:"#ef4444"}}>{t("delete")}</div>
            </div>
            )}
            </td>
            </tr>
          );
          })}
          </tbody>

          </table>
          )}
          <div style={{
        display: "flex",
        justifyContent: "center",
        gap: 6,
        marginTop: 15
      }}>
        {/* Previous */}
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          style={pageBtn}
        >
          {"<"}
        </button>

        {/* Page Numbers */}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((page) =>
            page === 1 ||
            page === totalPages ||
            Math.abs(page - currentPage) <= 1
          )
          .map((page, index, arr) => (
            <span key={page}>
              {index > 0 && page - arr[index - 1] > 1 && <span>...</span>}

              <button
                onClick={() => setCurrentPage(page)}
                style={{
                  ...pageBtn,
                  background: currentPage === page ? "#d1d5db" : "#fff"
                }}
              >
                {page}
              </button>
            </span>
          ))}

        {/* Next */}
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          style={pageBtn}
        >
          {">"}
        </button>
      </div>
    </div>

          );

          };

          /* ---------- Styles ---------- */

          const tableStyle={
            width:"100%",
            borderCollapse:"collapse" as const,
            background:"#fff",
            boxShadow:"0 8px 24px rgba(0,0,0,0.12)"
          };

          const thStyle={
            padding:12,
            borderBottom:"1px solid #ddd",
            textAlign:"left" as const
          };

          const tdStyle={
            padding:12,
            borderBottom:"1px solid #eee"
          };

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
            position: "absolute" as const,
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
            pointerEvents: "none" as const
          };

          const dateInput = {
            height: 40,
            padding: "0 10px 0 32px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            width: 150
          };

          export default AdminPage;