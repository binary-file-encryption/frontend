import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./../css/MainPage.css";
import downloadImage from "../assets/download.png"

/**
 * 1. 현재 로그인한 사용자가 업로드한 파일 목록 조회
 * 2. 사용자가 선택한 파일 업로드(암호화 업로드 포함)
 */
const MainPage = () => {
    const nav = useNavigate();
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadedFile, setUploadedFile] = useState([]);
    // 테스트용 샘플 데이터
    const fileList = Array.from({ length: 5 }, (_, index) => {
        const num = index + 1;
        return {
            id: num,
            originalName: `test${num}.bin`,
            encryptedName: `test${num}_enc.bin`,
            iv: "1234567890ABCDEF",
            date: "2024-03-01 12:00:00",
        };
    });

    /**
     * 렌더링 이후 사용자 업로드 파일 조회
     * 조회 성공시 재렌더링
     */
    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const jwt = localStorage.getItem("jwt");
                const res = await axios.get("https://52.78.79.66.nip.io/api/files/mine", {
                    headers: {
                        Authorization: `${jwt}`,
                        "Content-Type": "application/json",
                    },
                    params: {
                        page: 0,
                        size: 5,
                    },
                    validateStatus: () => true,
                });

                const { isSuccess, code, message, result } = res.data;

                if (!isSuccess) {
                    switch (code) {
                        case "USER4001":
                            console.error("존재하지 않는 사용자입니다.");
                            alert("사용자 정보를 찾을 수 없습니다.");
                            break;
                        case "TOKEN4001":
                            console.error("JWT 만료 또는 유효하지 않음");
                            alert("로그인 세션이 만료되었습니다. 다시 로그인 해주세요.");
                            localStorage.removeItem("jwt");
                            nav("/signin");
                            break;
                        default:
                            console.error("파일 조회 실패:", message);
                            alert("파일 목록을 불러오는 데 실패했습니다.");
                    }
                    return;
                }

                setUploadedFile(result);
            } catch (err) {
                console.error("파일 조회 중 예외 발생:", err);
                alert("서버와의 통신 중 오류가 발생했습니다.");
            }
        };

        fetchFiles();
    }, [nav]);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    return (
        <div className="main-container">
            <div className="content-box">
                <div className="upload-section">
                    <div className="file-input-group">
                        <input
                            type="file"
                            id="file"
                            style={{ display: "none" }}
                            onChange={handleFileChange}
                        />
                        <input
                            type="text"
                            className="file-name-display"
                            value={selectedFile ? selectedFile.name : ""}
                            readOnly
                            placeholder="암호화 대상 파일을 업로드 하세요."
                        />
                        <label htmlFor="file" className="file-label">
                            찾아보기
                        </label>
                    </div>
                    <button className="submit-button">제출하기</button>
                </div>

                <table className="file-table">
                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>암호화 대상 파일</th>
                            <th>암호화 된 파일</th>
                            <th>IV 값</th>
                            <th>일시</th>
                        </tr>
                    </thead>
                    <tbody>
                        {uploadedFile.map((file, idx) => (
                            <tr key={idx}>
                                <td>{idx + 1}</td>
                                <td>
                                    {file.originalFileName}
                                    <img
                                        src={downloadImage}
                                        alt="다운로드"
                                        className="download-img"
                                        onClick={() => console.log("원본 파일 다운로드")}
                                    />
                                </td>
                                <td>
                                    {file.encryptedFileName}
                                    <img
                                        src={downloadImage}
                                        alt="다운로드"
                                        className="download-img"
                                        onClick={() => console.log("암호화 파일 다운로드")}
                                    />
                                </td>
                                <td>{file.ivValue}</td>
                                <td>{file.updatedAt.replace("T", " ")}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="pagination">
                    <span className="left-arrow">◀</span>
                    <span className="page-info">1 / 2</span>
                    <span className="right-arrow">▶</span>
                </div>
            </div>
        </div>
    );
};

export default MainPage;
