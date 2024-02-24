import React, { useRef, useState, useEffect } from "react";
import { useParams } from "react-router";
import { API_URL } from "../../config";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import Image from "../common/image";
import formattedPrice from "../common/formattedPrice";
import { notifyError } from "../common/toastify";
import { Link } from "react-router-dom";

function Detail() {
  const [product, setProduct] = useState({});
  const [images, setImages] = useState([]);
  const contentRef = useRef(null);

  let { id } = useParams();
  useEffect(() => {
    axios
      .get(`${API_URL}/api/get_product_by_id/${id}/`)
      .then((response) => {
        const data = response.data.data;

        setProduct(data);
      })
      .catch((e) => {
        if (e.response) {
          notifyError(e.response.data.message);
        }
      });
    axios
      .get(`${API_URL}/api/images_by_product_id/${id}/`)
      .then((response) => {
        setImages(response.data.data);
      })
      .catch((e) => {
        if (e.response) {
          notifyError(e.response.data.message);
        }
      });
  }, []);

  return (
    <main className="mainContent-theme ">
      <div id="product" className="productDetail-page">
        <div className="breadcrumb-shop">
          <div className="container">
            <div className="row">
              <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 pd5  ">
                <ol
                  className="breadcrumb breadcrumb-arrows"
                  itemScope=""
                  itemType="http://schema.org/BreadcrumbList"
                >
                  <li
                    itemProp="itemListElement"
                    itemScope=""
                    itemType="http://schema.org/ListItem"
                  >
                    <Link to="/" target="_self" itemProp="item">
                      <span itemProp="name">Trang chủ</span>
                    </Link>
                    <meta itemProp="position" content={1} />
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="row product-detail-wrapper">
            <div className="col-md-12 col-sm-12 col-xs-12">
              <div className="row product-detail-main pr_style_01">
                <div className="col-md-7 col-sm-12 col-xs-12">
                  <div className="product-gallery">
                    <div className="product-image-detail box__product-gallery scroll">
                      <ul
                        id="sliderproduct"
                        className="site-box-content 2 slide_product"
                      >
                        {images.map((image) => (
                          <li
                            className="product-gallery-item gallery-item"
                            key={image.id}
                          >
                            <Image
                              imagePath={image.image_url}
                              className="product-image-feature"
                            />
                          </li>
                        ))}
                        <li
                          className="product-gallery-item gallery-item"
                          ref={contentRef}
                        >
                          <img
                            className="product-image-feature"
                            src="https://giaycaosmartmen.com/wp-content/uploads/2020/09/bang-size-giay-Fila.png"
                            alt={product.name}
                          />
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div
                  className="col-md-5 col-sm-12 col-xs-12"
                  id="detail-product"
                >
                  <div className="product-title">
                    <h1>{product.name}</h1>
                    <span id="pro_sku">
                      <strong>SKU:</strong> ATN0146MMDE
                    </span>
                  </div>

                  <div className="product-price" id="price-preview">
                    <span className="pro-price">
                      {formattedPrice(product.price)}
                    </span>
                  </div>
                  <div className="select-swatch clearfix">
                    <div
                      id="variant-swatch-0"
                      className="swatch clearfix swarch-size"
                      data-option="option1"
                      data-option-index={0}
                    >
                      <a
                        className="pull-right"
                        style={{ margin: "10px 25px", cursor: "pointer" }}
                        onClick={() => {
                          contentRef.current.scrollIntoView({
                            behavior: "smooth",
                          });
                        }}
                      >
                        CÁCH CHỌN SIZE
                      </a>
                    </div>
                  </div>
                  <div
                    className="hrv-pmo-coupon"
                    data-hrvpmo-layout="minimum"
                  />
                  <div
                    className="hrv-pmo-discount"
                    data-hrvpmo-layout="minimum"
                  />
                  <div className="product-description">
                    <div className="title-bl">
                      <h2>Mô tả</h2>
                    </div>
                    <div className="description-content">
                      <div className="description-productdetail">
                        <p>{product.description}</p>
                        <p>
                          <strong>Hướng dẫn bảo quản:</strong>
                        </p>
                        <p>- Không dùng hóa chất tẩy.</p>
                        <p>- Ủi ở nhiệt độ thích hợp, hạn chế dùng máy sấy.</p>
                        <p>
                          - Giặt ở chế độ bình thường, với đồ có màu tương tự.
                          <br />
                        </p>
                      </div>
                      <a id="detail_more">
                        <span className="btn-effect">Xem thêm</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <hr />
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </main>
  );
}

export default Detail;
