import { Navigate } from "react-router-dom";

/**
 * JWT 여부에 따른 라우팅 처리
 * JWT 존재하지 않을 경우 로그인 페이지로 리다이렉트
 */
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("jwt");
    if (!token) { // 토큰 없는 경우
        return <Navigate to="/signin" replace />;
    }
    return children;
};

export default ProtectedRoute;
