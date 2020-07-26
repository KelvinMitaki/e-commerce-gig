import React from "react";
import Tabs from "react-responsive-tabs";

import "./SellerProducts.css";

import SellerDashBoardMenu from "./SellerDashBoardMenu";
import SellerDashBoardHeader from "./SellerDashBoardHeader";
import { fetchSellerProducts } from "../../redux/actions";
import DashBoardProduct from "./DashBoardProduct";
import { connect } from "react-redux";
import ScreenLoader from "../Pages/ScreenLoader";

class SellerProducts extends React.Component {
  state = {};
  componentDidMount() {
    this.props.fetchSellerProducts();
  }

  getTabs() {
    let tabs = [
      {
        title: "Total Products",
        data: (
          <DashBoardProduct
            products={this.props.sellerProducts}
            category="total"
          />
        )
      },
      { title: "Live On Site", data: <DashBoardProduct category="live" /> },
      { title: "Under Review", data: <DashBoardProduct category="review" /> },
      { title: "Rejected", data: <DashBoardProduct category="rejected" /> },
      { title: "Sold Out", data: <DashBoardProduct category="sold-out" /> }
    ];

    return tabs.map((tab, index) => ({
      title: tab.title,
      getContent: () => tab.data,
      key: index,
      tabClassName: "products-tab",
      panelClassName: "seller-db-panel"
    }));
  }
  render() {
    if (this.props.sellerProductsLoading) return <ScreenLoader />;
    return (
      <div className="container-fluid dashboard-wrapper">
        <SellerDashBoardHeader />
        <div className="row no-gutters">
          <div className="col-lg-3">
            <SellerDashBoardMenu />
          </div>
          <div className="col-lg-9 mt-5">
            <div className="container seller-dashboard-wrapper m-0">
              <div className="row">
                <div className="col-lg-12 p-0">
                  <Tabs
                    items={this.getTabs()}
                    transformWidth={720}
                    transform={true}
                    showMoreLabel={"More..."}
                    showInkBar={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
const mapStateToProps = state => {
  return {
    sellerProducts: state.sellerRegister.sellerProducts,
    sellerProductsLoading: state.auth.sellerProductsLoading
  };
};
export default connect(mapStateToProps, { fetchSellerProducts })(
  SellerProducts
);
