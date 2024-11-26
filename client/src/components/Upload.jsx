import React from "react";
import "./styles/upload.css";

const Upload = ({ onFileChange, onFileUpload, disabled }) => {

  return (
    <div className="upload-main ">
      <input className="col-md-6 " onChange={onFileChange} type="file" />
      <button onClick={onFileUpload} className=" upload-button">Upload</button>
      {/* <button onClick={onFileUpload} className=" upload-button" disabled={disabled}>{disabled ? 'Uploading...' : 'Upload'}</button> */}
    </div>
  );
};

export default Upload;
