import { useState } from "react";
import { useNavigate } from 'react-router-dom'
import axios from "axios";
import "./../css/SignInUp.css";

const SignUp = () => {
    const nav = useNavigate()
    const [form, setForm] = useState({
        username: "",
        password: "",
        confirmPassword: "",
    });

    const handleChange = (e) => {
        const updated = { ...form, [e.target.name]: e.target.value };
        setForm(updated);
        // 비밀번호 불일치시
        if (
            updated.password &&
            updated.confirmPassword &&
            updated.password !== updated.confirmPassword
        ) {
            setErrorMsg("비밀번호가 일치하지 않습니다.");
        } else {
            setErrorMsg(""); // 일치 시 오류 메시지 제거
        }
    };

    const isFormValid =
    form.username !== "" &&
    form.password !== "" &&
    form.confirmPassword !== "" &&
    form.password === form.confirmPassword;

    // 회원가입 실패 사유 출력용
    const [errorMsg, setErrorMsg] = useState("");

    // 회원가입 요청
    const handleSubmit = async (e) => {
        e.preventDefault(); // form 제출 x
        try {
            const res = await axios.post(
                "https://52.78.79.66.nip.io/api/user/join",
                form,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    // 커스텀 - 모든 HTTP 상태 코드에 대해 에러로 처리하지 않도록
                    validateStatus: function (status) {
                        return true;
                    },
                }
            );

            const { isSuccess, code, result, message } = res.data;

            if (!isSuccess) {
                switch (code) {
                    case "USER4003":
                        console.log("이미 사용중인 아이디입니다.");
                        setErrorMsg("이미 사용중인 아이디입니다.");
                        break;
                    default:
                        console.log("회원가입 실패:", message);
                        setErrorMsg("회원가입 실패: " + message);
                }
                return;
            }

            // 회원가입 성공
            if (isSuccess && result) {
                localStorage.setItem("jwt", result); // JWT 저장
                nav("/"); // 메인 페이지로 이동
            }
        } catch (err) {
            console.error("네트워크 오류 또는 알 수 없는 예외 발생:", err);
            alert("서버 통신 오류가 발생했습니다. 다시 시도해주세요.");
        }
    };

    return (
        <div className="signin-container">
            <div className="signin-box">
                <h2 className="signin-title">회원가입</h2>
                <form className="signin-form" onSubmit={handleSubmit}>
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
                        {/* 비밀번호 불일치, 회원가입 실패 */}
                        {errorMsg && <div className="error-message">{errorMsg}</div>}
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