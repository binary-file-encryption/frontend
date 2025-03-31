import { useState } from "react";
import axios from "axios";
import "./../css/SignInUp.css"; // CSS 파일 임포트
import { useNavigate } from 'react-router-dom'

const SignIn = () => {
    const nav = useNavigate()
    const [signInForm, setSignInForm] = useState({ username: "", password: "" })

    // 아이디, 비밀번호 입력시 동작
    const handleChange = (e) => {
        setSignInForm({ ...signInForm, [e.target.name]: e.target.value })
        setErrorMsg("");  // 에러메세지 초기화
    }

    // 값을 모두 입력했는지 확인
    const isFormValid = signInForm.username !== "" && signInForm.password !== "";

    // 로그인 실패 사유 출력용
    const [errorMsg, setErrorMsg] = useState("");

    // 로그인 요청
    const handleSubmit = async (e) => {
        e.preventDefault(); // form 제출 x
        try {
            const res = await axios.post(
                "https://52.78.79.66.nip.io/api/user/login",
                signInForm,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    // 커스텀 모든 HTTP 상태 코드에 대해 에러로 처리하지 않도록
                    validateStatus: function (status) {
                        return true;
                    },
                }
            );

            const { isSuccess, code, result, message } = res.data;

            if (!isSuccess) {
                // 서버가 반환한 code 값에 따른 분기 처리
                switch (code) {
                    case "USER4001":
                        console.log("해당하는 회원이 존재하지 않습니다.");
                        setErrorMsg("해당하는 회원이 존재하지 않습니다.");
                        break;
                    case "USER4002":
                        console.log("아이디 또는 비밀번호를 잘못 입력하였습니다.");
                        setErrorMsg("아이디 또는 비밀번호를 잘못 입력하였습니다.");
                        break;
                    default:
                        console.log("로그인 실패:", message);
                        setErrorMsg("로그인 실패: " + message);
                }
                return;
            }

            // 로그인 성공 처리
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
        <>
            <div className="signin-container">
                <div className="signin-box">
                    <h2 className="signin-title">로그인</h2>
                    <form onSubmit={handleSubmit} className="signin-form">
                        <div className="form-group">
                            <input
                                placeholder="아이디"
                                name="username"
                                value={signInForm.username}
                                onChange={handleChange} />
                        </div>
                        <div className="form-group password-group">
                            <input
                                placeholder="비밀번호"
                                type="password"
                                name="password"
                                value={signInForm.password}
                                onChange={handleChange} />
                            {/* 로그인 실패 원인 */}
                            {errorMsg && (
                                <div className="error-message">{errorMsg}</div>
                            )}
                        </div>

                        <button type="submit" className="signin-button" disabled={!isFormValid}>
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
