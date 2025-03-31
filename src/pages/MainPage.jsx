import { useState } from "react";
import "./../css/MainPage.css";
import downloadImage from "../assets/download.png"

/**
 * 1. 현재 로그인한 사용자가 업로드한 파일 목록 조회
 * 2. 사용자가 선택한 파일 업로드(암호화 업로드 포함)
 */
const MainPage = () => {
    const [selectedFile, setSelectedFile] = useState(null);
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

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    return (
        <div className="main-container">
            <div className="content-box">
                <div className="upload-section">
                    <div className="file-input-group">
                        <input type="file" id="file" style={{ display: "none" }} onChange={handleFileChange} />
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
                        {fileList.map((file, idx) => (
                            <tr key={file.id}>
                                <td>{idx + 1}</td>
                                <td>
                                    {file.originalName}
                                    <img
                                        src={downloadImage}
                                        alt="다운로드"
                                        sizes=""
                                        className="download-img"
                                        onClick={() => console.log("파일 다운로드")}
                                    />
                                </td>
                                <td>
                                    {file.encryptedName}
                                    <img
                                        src={downloadImage}
                                        alt="다운로드"
                                        sizes=""
                                        className="download-img"
                                        onClick={() => console.log("파일 다운로드")}
                                    />
                                </td>
                                <td>{file.iv}</td>
                                <td>{file.date}</td>
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
