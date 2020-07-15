import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import ReactDropzone from "./ReactDropzone";
import ReactCropper from "./ReactCropper";
import "./PhotosPage.css";
import { storeImage } from "../../redux/actions";
import { connect } from "react-redux";

const PhotosPage = ({ storeImage, storeImageLoading }) => {
  const [files, setFiles] = useState([]);
  const [image, setImage] = useState(null);
  useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [files]);
  const handleUploadImage = async () => {
    try {
      await storeImage(image);
      handleCancelCrop();
    } catch (error) {
      console.log("error", error);
    }
  };
  const handleCancelCrop = () => {
    setFiles([]);
    setImage(null);
  };
  return (
    <div
      className="container-v p-0 box-container"
      style={{ width: "90%", margin: "20px auto", borderRadius: "10px" }}
    >
      <div className="row product-image-upload-hero no-gutters">
        <div className="col-lg-4" style={{ textAlign: "center" }}>
          Step 1-Add Photo
        </div>
        <div className="col-lg-4" style={{ textAlign: "center" }}>
          Step 2-Resize
        </div>
        <div className="col-lg-4" style={{ textAlign: "center" }}>
          Step 3-Preview
        </div>
      </div>
      <hr className="mb-3" />
      <div className="row no-gutters align-items-center drop-stuff">
        <div className="col-lg-4">
          <ReactDropzone setFiles={setFiles} />
        </div>
        <div>
          {files.length > 0 && (
            <ReactCropper setImage={setImage} imagePreview={files[0].preview} />
          )}
        </div>
        <div>
          {files.length > 0 && (
            <React.Fragment>
              <div
                className="img-preview"
                style={{
                  minHeight: "200px",
                  // height: "100%",
                  width: "1200px",
                  overflow: "hidden",
                  // flex: "2",
                }}
              />
              <div
                style={{ cursor: "pointer" }}
                onClick={handleUploadImage}
                className="mt-3 product-upload-btn-wrapper"
              >
                <div style={{ textAlign: "center" }}>
                  {storeImageLoading && (
                    <span
                      className="spinner-grow spinner-grow-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  )}
                  {storeImageLoading ? (
                    <span> {"  "}Loading...</span>
                  ) : (
                    <span>Upload Image</span>
                  )}
                </div>
              </div>
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
};
const mapStateToProps = (state) => {
  return {
    storeImageLoading: state.product.storeImageLoading,
  };
};
export default connect(mapStateToProps, { storeImage })(PhotosPage);