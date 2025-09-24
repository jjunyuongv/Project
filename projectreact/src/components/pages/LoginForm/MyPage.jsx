// @ts-nocheck
import React, { useEffect, useState } from "react";
import { useAuth } from './AuthContext';
// ✅ 공용 axios 인스턴스 사용 (baseURL:'/api', withCredentials:true 권장)
import api from "../../../api/axios";
import { useNavigate } from "react-router-dom";

export default function MyPage() {
    const { isLoggedIn, user } = useAuth();
    const navigate = useNavigate();
    const [employeeData, setEmployeeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("info"); // info / edit / password

    // 내 정보 수정 상태
    const [editData, setEditData] = useState({
        name: "",
        gender: "",
        loginId: "",
        address: "",
        phone: "",
        department: "",
        job: "",
        currentPassword: ""
    });

    // 비밀번호 변경 상태
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    useEffect(() => {
        if (activeTab === "password") {
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        }
    }, [activeTab]);

    const inputStyle = {
        padding: "8px 12px",
        borderRadius: "6px",
        border: "1px solid #e0e0e0",
        width: "100%",
        backgroundColor: "#f8f9fa"
    };

    useEffect(() => {
        if (!isLoggedIn) {
            setLoading(false);
            return;
        }

        // user가 아직 준비되지 않았으면 기다림
        if (!user) return;

        // 소셜 로그인 접근 제한
        if (user.loginId?.startsWith("kakao_") || user.loginId?.startsWith("google_")) {
            alert("소셜 계정은 마이페이지 접근이 제한됩니다.");
            navigate(-1);
            return;
        }

        // ✅ '/api' 상대 경로 호출 (Vite/Nginx 프록시 공통)
        api.get("/employees/session-check")
            .then(res => {
                setEmployeeData(res.data);
                setEditData({
                    name: res.data.name || "",
                    gender: res.data.gender || "",
                    loginId: res.data.loginId || "",
                    address: res.data.address || "",
                    phone: res.data.phone || "",
                    department: res.data.department || "",
                    job: res.data.job || "",
                    currentPassword: ""
                });
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [isLoggedIn, user, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(name, value);
        if (name === "address") return;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveInfo = () => {
        if (!editData.name || !editData.gender || !editData.loginId || !editData.address || !editData.phone || !editData.currentPassword) {
            alert("모든 항목과 비밀번호를 입력해주세요.");
            return;
        }

        const payload = {
            name: editData.name,
            gender: editData.gender,
            loginId: editData.loginId,
            address: editData.address,
            phone: editData.phone,
            department: editData.department,
            job: editData.job,
            currentPassword: editData.currentPassword
        };

        api.put("/employees/update-info", payload)
            .then(res => {
                setEmployeeData(prev => ({ ...prev, ...editData }));
                setEditData(prev => ({ ...prev, currentPassword: "" }));
                alert("정보가 수정되었습니다.");
            })
            .catch(err => {
                console.error(err);
                alert(err.response?.data || "수정에 실패했습니다.");
            });
    };

    const handlePasswordChangeInput = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = () => {
        const { currentPassword, newPassword, confirmPassword } = passwordData;
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert("모든 항목을 입력해주세요.");
            return;
        }
        if (newPassword !== confirmPassword) {
            alert("새 비밀번호와 확인이 일치하지 않습니다.");
            return;
        }

        api.put("/employees/update-password", { currentPassword, newPassword })
            .then(res => {
                alert("비밀번호가 변경되었습니다.");
                setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            })
            .catch(err => {
                console.error(err);
                alert(err.response?.data || "비밀번호 변경에 실패했습니다.");
            });
    };

    const daumAPI = () => {
        new window.daum.Postcode({
            oncomplete: function (data) {
                setEditData(prev => ({ ...prev, address: data.address }));
            }
        }).open();
    };

    if (loading) return <p style={{ textAlign: "center", marginTop: "50px" }}>로딩 중...</p>;
    if (!isLoggedIn) return <p style={{ textAlign: "center", marginTop: "50px" }}>로그인이 필요합니다.</p>;

    const infoList = [
        { label: "이름", value: employeeData.name },
        { label: "성별", value: employeeData.gender },
        { label: "부서", value: employeeData.department },
        { label: "직무", value: employeeData.job },
        { label: "아이디", value: employeeData.loginId },
        { label: "이메일", value: employeeData.email },
        { label: "주소", value: employeeData.address },
        { label: "휴대폰", value: employeeData.phone },
    ];

    const readOnlyStyle = {
        ...inputStyle,
        backgroundColor: "#adb5bd",
        cursor: "not-allowed"
    };

    return (
        <div className="bg-light min-vh-100 d-flex flex-column">
            <header>
                <section style={{
                    height: 300,
                    backgroundImage: "url('/Generated.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    position: "relative",
                }}>
                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 0 }} />
                    <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                        <h1 style={{ color: "#fff", fontSize: "36px", fontWeight: 800, letterSpacing: "1px", textShadow: "0 2px 12px rgba(0,0,0,0.35)", margin: 0 }}>마이페이지</h1>
                    </div>
                </section>
            </header>

            <main style={{
                minHeight: "calc(100vh - 300px)",
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                padding: "30px",
                gap: "30px"
            }}>
                <aside style={{
                    width: "200px",
                    backgroundColor: "#fff",
                    padding: "20px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                    height: "fit-content"
                }}>
                    <h5 style={{ fontWeight: 700, marginBottom: "20px" }}>마이페이지</h5>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        <li onClick={() => setActiveTab("info")} style={{ padding: "10px", borderRadius: "6px", backgroundColor: activeTab === "info" ? "#f8f9fa" : "transparent", fontWeight: 600, cursor: "pointer" }}>내 정보</li>
                        <li onClick={() => setActiveTab("edit")} style={{ padding: "10px", borderRadius: "6px", backgroundColor: activeTab === "edit" ? "#f8f9fa" : "transparent", fontWeight: 600, cursor: "pointer" }}>내 정보 수정</li>
                        <li onClick={() => setActiveTab("password")} style={{ padding: "10px", borderRadius: "6px", backgroundColor: activeTab === "password" ? "#f8f9fa" : "transparent", fontWeight: 600, cursor: "pointer" }}>비밀번호 변경</li>
                    </ul>
                </aside>

                <div style={{ maxWidth: "500px", width: "100%", padding: "20px", backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                    {activeTab === "info" && (
                        <div style={{ display: "grid", gridTemplateColumns: "max-content 1fr", rowGap: "15px", columnGap: "15px", alignItems: "center" }}>
                            {infoList.map((item, index) => item.value && (
                                <React.Fragment key={index}>
                                    <div style={{ fontWeight: 600, color: "#555", textAlign: "right" }}>{item.label}:</div>
                                    <div style={{ padding: "8px 12px", border: "1px solid #e0e0e0", borderRadius: "6px", backgroundColor: "#fff" }}>
                                        {item.value}
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                    )}

                    {activeTab === "edit" && (
                        <div style={{ display: "grid", gridTemplateColumns: "max-content 1fr", rowGap: "15px", columnGap: "15px", alignItems: "center" }}>
                            <div style={{ fontWeight: 600, color: "#555", textAlign: "right" }}>이름:</div>
                            <input type="text" name="name" value={editData.name} onChange={handleChange} style={inputStyle} />

                            <div style={{ fontWeight: 600, color: "#555", textAlign: "right" }}>성별:</div>
                            <div>
                                <label style={{ marginRight: "10px" }}>
                                    <input type="radio" name="gender" value="남자" checked={editData.gender === "남자"} onChange={handleChange} />남자
                                </label>
                                <label>
                                    <input type="radio" name="gender" value="여자" checked={editData.gender === "여자"} onChange={handleChange} />여자
                                </label>
                            </div>

                            <div style={{ fontWeight: 600, color: "#555", textAlign: "right" }}>부서:</div>
                            <input type="text" value={editData.department} readOnly style={readOnlyStyle} />

                            <div style={{ fontWeight: 600, color: "#555", textAlign: "right" }}>직무:</div>
                            <input type="text" value={editData.job} readOnly style={readOnlyStyle} />

                            <div style={{ fontWeight: 600, color: "#555", textAlign: "right" }}>아이디:</div>
                            <input type="text" name="loginId" value={editData.loginId} onChange={handleChange} style={inputStyle} />

                            <div style={{ fontWeight: 600, color: "#555", textAlign: "right" }}>이메일:</div>
                            <input type="text" value={employeeData.email} readOnly style={readOnlyStyle} />

                            <div style={{ fontWeight: 600, color: "#555", textAlign: "right" }}>주소:</div>
                            <div style={{ display: "flex", gap: "8px", flexWrap: "nowrap" }}>
                                <input
                                    type="text"
                                    name="address"
                                    value={editData.address}
                                    readOnly
                                    style={{ ...inputStyle, flex: 1 }}
                                />
                                <button className="btn-primary-KHS" onClick={daumAPI}>주소검색</button>
                            </div>

                            <div style={{ fontWeight: 600, color: "#555", textAlign: "right" }}>휴대폰:</div>
                            <input type="text" name="phone" value={editData.phone} onChange={handleChange} style={inputStyle} />

                            <div style={{ fontWeight: 600, color: "#555", textAlign: "right" }}>비밀번호 확인:</div>
                            <input type="password" name="currentPassword" value={editData.currentPassword} onChange={handleChange} style={inputStyle} />

                            <div></div>
                            <button className="btn-primary-KHS" onClick={handleSaveInfo}>저장</button>
                        </div>
                    )}

                    {activeTab === "password" && (
                        <div style={{ display: "grid", gridTemplateColumns: "max-content 1fr", rowGap: "15px", columnGap: "15px", alignItems: "center" }}>
                            <div style={{ textAlign: "right" }}>현재 비밀번호:</div>
                            <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChangeInput} style={inputStyle} />

                            <div style={{ textAlign: "right" }}>새 비밀번호:</div>
                            <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChangeInput} style={inputStyle} />

                            <div style={{ textAlign: "right" }}>새 비밀번호 확인:</div>
                            <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChangeInput} style={inputStyle} />

                            <div></div>
                            <button className="btn-primary-KHS" onClick={handlePasswordChange}>비밀번호 저장</button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
