import { useCallback ,useEffect, useState } from "react";
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

    // 파일 업로드 progress state
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [showProgress, setShowProgress] = useState(false);

    // 파일 다운로드 요청
    const fetchFiles = useCallback(async () => {
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
    }, [currentPage, nav]);

    /**
     * 렌더링 이후 사용자 업로드 파일 조회
     * 조회 성공시 재렌더링
     */
    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);


    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const maxSize = 200 * 1024 * 1024; // 200MB
        if (file && file.size > maxSize) {
            alert("업로드 가능한 파일 크기는 200MB 이하입니다.");
            // 파일 선택 초기화
            e.target.value = "";
            return;
        }
        setSelectedFile(file);
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
                        switch (data.code) {
                            case "S35005":
                                alert("파일을 찾을 수 없습니다.");
                                break
                            case "TOKEN4001":
                                alert("로그인 세션이 만료되었습니다. 다시 로그인 해주세요.");
                                localStorage.removeItem("jwt");
                                nav("/signin");
                                break;
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

    // 파일 업로드
    const handleUpload = async () => {
        if (!selectedFile) {
            alert("파일을 선택하세요.");
            return;
        }

        const jwt = localStorage.getItem("jwt");
        const formData = new FormData();
        formData.append("file", selectedFile);

        setIsUploading(true);
        setUploadProgress(0);
        setShowProgress(false);

        // 3초 후 progress bar 표시
        const timer = setTimeout(() => {
            setShowProgress(true);
        }, 3000);

        try {
            const response = await axios.post(
                "https://52.78.79.66.nip.io/api/files/upload-and-encrypt",
                formData,
                {
                    headers: {
                        Authorization: `${jwt}`,
                        "Content-Type": "multipart/form-data",
                    },
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            let percentCompleted = Math.round(
                                (progressEvent.loaded * 100) / progressEvent.total
                            );
                            // 서버 응답 전에는 최대 90%까지만 표시
                            // 추후 웹소켓이나 SSE를 적용하여, 서버 응답에 맞춰 진행상황 보여주는 방식으로 수정 고려?
                            if (percentCompleted >= 100) {
                                percentCompleted = 90;
                            }
                            setUploadProgress(percentCompleted);
                        }
                    },
                    validateStatus: () => true,
                }
            );

            clearTimeout(timer);
            // 서버 응답을 받은 후 progress를 100%로 업데이트
            setUploadProgress(100);
            setIsUploading(false);
            setShowProgress(false);

            const { isSuccess, code, message, result } = response.data;
            if (!isSuccess) {
                switch (code) {
                    case "USER4001":
                        alert("해당하는 사용자가 존재하지 않습니다.");
                        break;
                    case "TOKEN4001":
                        alert("토큰이 없거나 만료되었습니다.");
                        break;
                    case "S35001":
                    case "S35002":
                    case "S35003":
                    case "S35005":
                        alert("S3에 파일 업로드 중 문제가 발생했습니다. 오류 코드: " + code);
                        break;
                    case "ENCRYPT5001":
                        alert("파일 암호화에 실패했습니다.");
                        break;
                    default:
                        alert("파일 업로드에 실패했습니다.");
                }
                return;
            }

            // 업로드 성공 시 0번째 인덱스에 추가
            if (result && result.uploadedFile && result.uploadedFile.length > 0) {
                setUploadedFile((prev) => [result.uploadedFile[0], ...prev]);
            }
            alert("파일 업로드 성공!");
            setSelectedFile(null); // 선택한 파일 초기화
            fetchFiles();
        } catch (error) {
            clearTimeout(timer);
            setIsUploading(false);
            setShowProgress(false);
            alert("파일 업로드 중 오류가 발생했습니다.");
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
                    <button className="submit-button" onClick={handleUpload}>제출하기</button>
                    {/* 업로드에 3초 이상 걸릴 경우 진행 상태 표시 */}
                    {showProgress && isUploading && (
                        <div
                            className="progress-bar-container"
                            style={{
                                marginTop: "10px",
                                width: "100%",
                                height: "20px",
                                backgroundColor: "#e0e0e0",
                                borderRadius: "5px",
                                position: "relative",
                            }}
                        >
                            <div
                                className="progress-bar"
                                style={{
                                    height: "100%",
                                    backgroundColor: "#007bff",
                                    borderRadius: "5px",
                                    transition: "width 0.2s ease",
                                    width: `${uploadProgress}%`,
                                }}
                            ></div>
                            <span>{uploadProgress}%</span>
                        </div>
                    )}
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
