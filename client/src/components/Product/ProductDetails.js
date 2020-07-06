import React from "react";

class ProductDetails extends React.Component {
  render() {
    console.log(this.props);
    return (
      <div style={{ width: "100%", backgroundColor: "#fff", padding: "10px" }}>
        <p>{this.props.data}</p>
      </div>
    );
  }
}

export default ProductDetails;