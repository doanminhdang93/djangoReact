import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../config";
import { ToastContainer } from "react-toastify";
import Image from "../common/image";
import formattedPrice from "../common/formattedPrice";
import { notifyError } from "../common/toastify";
import { Link } from "react-router-dom";

function Home() {
  const [listProduct, setListProduct] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/get_products_data/`)
      .then((response) => {
        const data = response.data.data;
        const sortedProducts = data.sort((a, b) => b.id - a.id);

        // Lấy ra 8 sản phẩm đầu tiên
        const top8Products = sortedProducts.slice(0, 8);
        setListProduct(top8Products);
      })
      .catch((e) => {
        if (e.response) {
          notifyError(e.response.data.message);
        }
      });
  }, []);

  return (
    <>
      <main className="mainContent-theme  mainContent-index">
        <section className="section wrapper-hometabs-collection">
          <div className="container">
            <div className="wrapper-heading-home">
              <h1>SẢN PHẨM MỚI</h1>
            </div>
            <div className="tab-content tabs-products">
              <div className="tab-item active" id="tab1" data-get="true">
                <div className="listProduct-carousel--overflow">
                  <div className="product-lists row">
                    {listProduct.map((product, index) => (
                      <div
                        key={product.id}
                        className="pro-loop animated fadeIn col-md-3"
                      >
                        <div
                          className="product-block"
                          data-anmation={index + 1}
                        >
                          <div className="product-img fade-box">
                            <Link
                              to={"/detail/" + product.id}
                              title={product.name}
                              className="image-resize"
                            >
                              <picture>
                                <Image
                                  imagePath={product.url_image1}
                                  className="lazyload"
                                />
                              </picture>
                              <picture>
                                <Image
                                  imagePath={product.url_image2}
                                  className="lazyload"
                                />
                              </picture>
                            </Link>
                            <div className="button-add">
                              <button title="Xem chi tiết" className="action">
                                <Link
                                  to={"/detail/" + product.id}
                                  style={{ color: "white" }}
                                >
                                  Xem chi tiết
                                </Link>
                              </button>
                            </div>
                          </div>
                          <div className="product-detail clearfix">
                            <div className="box-pro-detail">
                              <h3 className="pro-name">
                                <Link
                                  to={`/detail/${product.id}`}
                                  title={product.name}
                                >
                                  {product.name}
                                </Link>
                              </h3>
                              <div className="box-pro-prices">
                                <p className="pro-price ">
                                  {formattedPrice(product.price)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <ToastContainer />
    </>
  );
}

export default Home;
