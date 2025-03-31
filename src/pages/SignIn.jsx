import { useState } from "react";
import "./../css/SignIn.css"; // CSS 파일 임포트
import { useNavigate } from 'react-router-dom'

const SignIn = () => {
    const nav = useNavigate()
    const [signInForm, setSignInForm] = useState({ username: "", password: "" })

    // 아이디, 비밀번호 입력시 동작
    const handleChange = (e) => {
        console.log(e.target.name)
        console.log(e.target.value)
        setSignInForm({ ...signInForm, [e.target.name]: e.target.value })
    }

    // 값을 모두 입력했는지 확인
    const isFormValid = signInForm.username !== "" && signInForm.password !== "";

    return (
        <>
            <div className="signin-container">
                <div className="signin-box">
                    <h2 className="signin-title">로그인</h2>
                    <form onSubmit={() => console.log("제출")} className="signin-form">
                        <div className="form-group">
                            <input
                                placeholder="아이디"
                                name="username"
                                value={signInForm.username}
                                onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <input
                                placeholder="비밀번호"
                                type="password"
                                name="password"
                                value={signInForm.password}
                                onChange={handleChange} />
                        </div>
                        <button type="submit" className="signin-button" disabled = {!isFormValid}>
                            로그인
                        </button>
                    </form>
                    <div className="signup-redirect">
                        계정이 없으신가요?{" "}
                        <span className="signup-link" onClick={() => nav("/signup")}>
                            회원가입
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SignIn;
