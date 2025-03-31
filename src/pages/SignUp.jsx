import { useState } from "react";
import "./../css/SignInUp.css"; 

const SignUp = () => {
    const [form, setForm] = useState({
        username: "",
        password: "",
        confirmPassword: "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // 모든 값 입력 확인
    const isFormValid =
        form.username !== "" &&
        form.password !== "" &&
        form.confirmPassword !== "" &&
        form.password === form.confirmPassword;

    return (
        <div className="signin-container">
            <div className="signin-box">
                <h2 className="signin-title">회원가입</h2>
                <form className="signin-form">
                    <div className="form-group">
                        <input
                            placeholder="아이디"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group password-group">
                        <input
                            placeholder="비밀번호"
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group password-group">
                        <input
                            placeholder="비밀번호 재확인"
                            type="password"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                        />
                        {/* 비밀번호 불일치시 */}
                        {form.confirmPassword &&
                            form.password !== form.confirmPassword && (
                                <div className="error-message">비밀번호가 일치하지 않습니다.</div>
                            )}
                    </div>
                    <button type="submit" className="signin-button" disabled={!isFormValid}>
                        회원가입
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignUp;