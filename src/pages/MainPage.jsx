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
    const [currentPage, setCurrentPage] = useState(0) // 화면상 현재 보고 있는 페이지(페이지네이션)

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
                        page: currentPage,
                        size: 5,
                    },
                    validateStatus: () => true,
                });

                const { isSuccess, code, message, result } = res.data;

                if (!isSuccess) {
                    switch (code) {
                        case "USER4001":
                            alert("사용자 정보를 찾을 수 없습니다.");
                            break;
                        case "TOKEN4001":
                            alert("로그인 세션이 만료되었습니다. 다시 로그인 해주세요.");
                            localStorage.removeItem("jwt");
                            nav("/signin");
                            break;
                        default:
                            alert("파일 목록을 불러오는 데 실패했습니다.");
                    }
                    return;
                }

                setUploadedFile(result);
            } catch (err) {
                alert("서버와의 통신 중 오류가 발생했습니다.");
            }
        };

        fetchFiles();
    }, [currentPage, nav]); // 페이지 변경시 리랜더링


    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    // 파일 다운로드
    const handleDownload = async (fileName) => {
        try {
            const jwt = localStorage.getItem("jwt");
            const response = await axios.get(
                `https://52.78.79.66.nip.io/api/files/download`,
                {
                    headers: {
                        Authorization: `${jwt}`,
                    },
                    params: {
                        name: fileName,
                    },
                    responseType: "blob",
                    validateStatus: () => true,
                }
            );

            if (response.status === 200) {
                // binary large object : 파일 데이터를 다루기 위한 객체
                const blob = new Blob([response.data], { type: "application/octet-stream" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } else {
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const data = JSON.parse(reader.result);
                        switch(data.code){
                            case "S35005":
                                alert("파일을 찾을 수 없습니다.");
                                break
                            default:
                                alert("다운로드 실패: " + data.message);
                                break
                        }
                    } catch {
                        alert("파일 다운로드 중 오류가 발생했습니다.");
                    }
                };
                reader.readAsText(response.data); // blob에서 JSON 추출
            }
        } catch (error) {
            console.error("다운로드 오류:", error);
            alert("파일 다운로드 중 네트워크 오류가 발생했습니다.");
        }
    };
    // 왼쪽 페이지 이동
    const handlePrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    // 오른쪽 페이지 이동
    const handleNextPage = () => {
        if (uploadedFile.length === 5) {
            setCurrentPage((prev) => prev + 1);
        }
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
                                <td>{(currentPage * 5) + (idx + 1)}</td>
                                <td>
                                    {file.originalFileName}
                                    <img
                                        src={downloadImage}
                                        alt="다운로드"
                                        className="download-img"
                                        onClick={() => handleDownload(file.savedOriginalFileName)}
                                    />
                                </td>
                                <td>
                                    {file.encryptedFileName}
                                    <img
                                        src={downloadImage}
                                        alt="다운로드"
                                        className="download-img"
                                        onClick={() => handleDownload(file.savedEncryptedFileName)}
                                    />
                                </td>
                                <td>{file.ivValue}</td>
                                <td>{file.updatedAt.replace("T", " ")}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="pagination">
                    <span
                        className={`left-arrow ${currentPage === 0 ? "disabled" : ""}`}
                        onClick={handlePrevPage}>◀</span>
                    <span className="page-info">{currentPage + 1}</span>
                    <span
                        className={`right-arrow ${uploadedFile.length < 5 ? "disabled" : ""}`}
                        onClick={handleNextPage}>▶</span>
                </div>
            </div>
        </div>
    );
};

export default MainPage;
