import React, { useState, useRef, useEffect } from "react";
import "../../App.css";
import { API_URL, storage } from "../../config";
import axios from "axios";
import Pagination from "https://cdn.skypack.dev/rc-pagination@3.1.15";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { ref, uploadBytes, deleteObject } from "firebase/storage";
import Image from "../common/image";
import formattedPrice from "../common/formattedPrice";
import { notifyError, notifySuccess } from "../common/toastify";
import "./loading.css";

function ManageProduct() {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const role = localStorage.getItem("role");
  if (!isLoggedIn && role !== "admin") {
    window.location.href = "/";
  }
  const [isVisible, setVisible] = useState(false);
  const [idItem, setIdItem] = useState(0);
  const [isReload, setIsReload] = useState(false);
  const productNameRef = useRef(null);
  const priceRef = useRef(null);
  const quantityRef = useRef(null);
  const descriptionRef = useRef(null);
  const imagesRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/get_products_data/`)
      .then((response) => {
        setProducts(response.data.data);
      })
      .catch((e) => {
        if (e.response) {
          notifyError(e.response.data.message);
        }
      });
  }, [isReload]);

  const handleClickEdit = async (id) => {
    await axios
      .get(`${API_URL}/api/get_product_by_id/${id}/`)
      .then((response) => {
        if (response.status === 200) {
          setVisible(true);
          setTimeout(() => {
            const { name, price, description, quantity } = response.data.data;

            productNameRef.current.value = name;
            priceRef.current.value = price;
            descriptionRef.current.value = description;
            quantityRef.current.value = quantity;
          });

          setIdItem(id);
        } else {
          notifyError("Lỗi khi lấy thông tin sản phẩm");
        }
      })
      .catch((e) => {
        if (e.response) {
          notifyError(e.response.data.message);
        }
      });
    await axios
      .get(`${API_URL}/api/images_by_product_id/${id}/`)
      .then((response) => {
        setImages(response.data.data);
      })
      .catch((e) => {
        if (e.response) {
          notifyError(e.response.data.message);
        }
      });
  };

  const handleClickDelete = async (id) => {
    confirmAlert({
      title: "Xác nhận xóa",
      message: "Bạn muốn xóa thông tin sản phẩm?",
      buttons: [
        {
          label: "Xác nhận",
          onClick: () => handleConfirmDelete(id),
        },
        {
          label: "Hủy",
          onClick: () => handleCancelDelete(),
        },
      ],
      closeOnEscape: true,
      closeOnClickOutside: true,
      keyCodeForClose: [8, 32],
      willUnmount: () => {},
      afterClose: () => {},
      onClickOutside: () => {},
      onKeypress: () => {},
      onKeypressEscape: () => {},
      overlayClassName: "overlay-custom-class-name",
    });
  };

  const handleConfirmDelete = async (id) => {
    try {
      setIsLoading(true);
      const response = await axios.delete(
        `${API_URL}/api/delete_product/${id}/`
      );
      setIsLoading(false);
      if (response.status === 200) {
        notifySuccess("Xóa dữ liệu thành công");
        setVisible(false);
        setIsReload(!isReload);
      } else {
        notifyError("Lỗi khi xóa sản phẩm");
      }
    } catch (e) {
      setIsLoading(false);
      if (e.response) {
        notifyError(e.response.data.message);
      }
    }
  };

  const handleCancelDelete = () => {};

  const clickSetVisible = () => {
    setIdItem(0);
    setVisible(!isVisible);
    setImages([]);
    setSelectedImages([]);
  };

  const clickBtnAdd_Edit = async () => {
    const productName = productNameRef.current.value;
    const price = priceRef.current.value;
    const quantity = quantityRef.current.value;
    const description = descriptionRef.current.value;

    if (!productName || !price || !description || !quantity) {
      notifyError("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (price < 0) {
      notifyError("Vui lòng nhập giá tiền hợp lệ");
      return;
    }
    if (quantity < 0) {
      notifyError("Vui lòng nhập số lượng hợp lệ");
      return;
    }

    if (idItem === 0) {
      if (selectedImages.length < 2) {
        notifyError("Vui lòng chọn ít nhất 2 hình ảnh");
        return;
      }
      setIsLoading(true);

      let url_image = [];
      if (selectedImages.length > 0) {
        for (const image of selectedImages) {
          url_image.push({ url: `public/learnfirebase/${image.name}` });
        }
      }

      const data = {
        name: productName,
        price: price,
        description: description,
        quantity: quantity,
        images: url_image,
      };

      axios
        .post(`${API_URL}/api/add_product/`, data)
        .then(async (response) => {
          if (response.status === 200) {
            await uploadImages();
            clickSetVisible();
            notifySuccess("Thêm mới dữ liệu thành công");
            setIsReload(!isReload);
          } else {
            notifyError("Lỗi khi thêm mới sản phẩm");
          }
        })
        .catch((e) => {
          if (e.response) {
            notifyError(e.response.data.message);
          }
        });
    } else {
      setIsLoading(true);

      let url_image = [];

      if (selectedImages.length > 0) {
        for (const image of selectedImages) {
          url_image.push({ url: `public/learnfirebase/${image.name}` });
        }
      }

      const data = {
        name: productName,
        price: price,
        description: description,
        quantity: quantity,
        images: url_image,
      };

      axios
        .put(`${API_URL}/api/update_product/${idItem}/`, data)
        .then(async (response) => {
          if (response.status === 200) {
            await uploadImages();
            clickSetVisible();
            notifySuccess(`Cập nhật dữ liệu thành công`);
            setIsReload(!isReload);
          } else {
            notifyError("Lỗi khi cập nhật thông tin sản phẩm");
          }
        })
        .catch((e) => {
          if (e.response) {
            notifyError(e.response.data.message);
          }
        });
      setIdItem(0);
    }
    setIsLoading(false);
  };

  const handleFileChange = (e) => {
    setSelectedImages(Array.from(e.target.files));
  };

  const deleteImage = (id, url_image) => {
    if (images.length === 2) {
      notifyError("Mỗi sản phẩm phải có ít nhất 2 hình ảnh");
      return;
    }
    confirmAlert({
      title: "Xác nhận xóa",
      message: "Bạn muốn xóa hình ảnh sản phẩm?",
      buttons: [
        {
          label: "Xác nhận",
          onClick: () => {
            setIsLoading(true);
            axios
              .delete(`${API_URL}/api/delete_image/${id}/`)
              .then((response) => {
                if (response.status === 200) {
                  const desertRef = ref(storage, url_image);
                  // Delete the file
                  deleteObject(desertRef)
                    .then(() => {
                      notifySuccess("Xóa hình ảnh thành công");
                      setImages(response.data.data);
                      setIsReload(!isReload);
                    })
                    .catch((error) => {
                      console.log(error);
                    });
                } else {
                  notifyError("Lỗi khi xóa hình ảnh");
                }
              })
              .catch((e) => {
                if (e.response) {
                  notifyError(e.response.data.message);
                }
              });
            setIsLoading(false);
          },
        },
        {
          label: "Hủy",
        },
      ],
      closeOnEscape: true,
      closeOnClickOutside: true,
      keyCodeForClose: [8, 32],
      willUnmount: () => {},
      afterClose: () => {},
      onClickOutside: () => {},
      onKeypress: () => {},
      onKeypressEscape: () => {},
      overlayClassName: "overlay-custom-class-name",
    });
  };

  const uploadImages = async () => {
    let url_image = [];
    if (selectedImages.length > 0) {
      for (const image of selectedImages) {
        const imageRef = ref(storage, `public/learnfirebase/${image.name}`);
        const snapshot = await uploadBytes(imageRef, image);
        url_image.push({ url: snapshot.metadata.fullPath });
      }
    }
  };

  const [size, setSize] = useState(10);
  const [current, setCurrent] = useState(1);

  const PerPageChange = (value) => {
    setSize(value);
    const newPerPage = Math.ceil(products.length / value);
    if (current > newPerPage) {
      setCurrent(newPerPage);
    }
  };

  const getData = (current, pageSize) => {
    return products.slice((current - 1) * pageSize, current * pageSize);
  };

  const PaginationChange = (page, pageSize) => {
    setCurrent(page);
    setSize(pageSize);
  };

  const PrevNextArrow = (current, type, originalElement) => {
    if (type === "prev") {
      return (
        <button>
          <i className="fa fa-angle-double-left"></i>
        </button>
      );
    }
    if (type === "next") {
      return (
        <button>
          <i className="fa fa-angle-double-right"></i>
        </button>
      );
    }
    return originalElement;
  };

  return (
    <>
      {isLoading && <div className="loading">Loading&#8230;</div>}
      <div className="container-fluid mt-5 mb-5">
        {role === "admin" ? (
          <>
            <div className="row justify-content-center">
              <div className="col-md-10">
                <div className="card">
                  <div className="card-body p-0">
                    <div className="table-filter-info">
                      <h1>QUẢN LÍ SẢN PHẨM</h1>

                      {isVisible ? (
                        <>
                          <div className="mt-3 row">
                            <div className="col-md-3">
                              <div className="form-group">
                                <label>
                                  Tên sản phẩm <b style={{ color: "red" }}>*</b>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  ref={productNameRef}
                                />
                              </div>
                              <div className="form-group">
                                <label>
                                  Số lượng <b style={{ color: "red" }}>*</b>
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  className="form-control"
                                  ref={quantityRef}
                                />
                              </div>
                              <div className="form-group">
                                <label>
                                  Mô tả <b style={{ color: "red" }}>*</b>
                                </label>
                                <textarea
                                  type="text"
                                  className="form-control"
                                  ref={descriptionRef}
                                />
                              </div>
                            </div>
                            <div className="col-md-3">
                              <div className="form-group">
                                <label>
                                  Giá <b style={{ color: "red" }}>*</b>
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  className="form-control"
                                  ref={priceRef}
                                />
                              </div>
                              <div className="form-group">
                                <label>
                                  Hình ảnh
                                  {idItem == 0 && (
                                    <b style={{ color: "red" }}>*</b>
                                  )}
                                </label>
                                <input
                                  type="file"
                                  multiple
                                  className="form-control"
                                  ref={imagesRef}
                                  onChange={handleFileChange}
                                  accept="image/*"
                                />
                              </div>
                              <div className="form-group row">
                                {selectedImages.map((image, index) => (
                                  <img
                                    key={index}
                                    src={URL.createObjectURL(image)}
                                    alt={`Selected ${index + 1}`}
                                    style={{ width: "100px" }}
                                  />
                                ))}
                              </div>
                              {selectedImages && <hr />}
                              <div className="form-group row">
                                {idItem !== 0 &&
                                  images.map((image, index) => (
                                    <div key={index}>
                                      <Image
                                        imagePath={image.image_url}
                                        style={{ width: "100px" }}
                                      />
                                      <a
                                        className="btn btn-danger ml-2"
                                        style={{ cursor: "pointer" }}
                                        onClick={() =>
                                          deleteImage(image.id, image.image_url)
                                        }
                                      >
                                        Xóa
                                      </a>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={clickSetVisible}
                        >
                          Thêm mới
                        </button>
                      )}
                      {isVisible && (
                        <div className="form-group">
                          <button
                            type="button"
                            className="btn btn-outline-success mr-3"
                            onClick={clickBtnAdd_Edit}
                          >
                            Thực thi
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-warning"
                            onClick={clickSetVisible}
                          >
                            Hủy
                          </button>
                        </div>
                      )}
                    </div>
                    {products ? (
                      <>
                        <Pagination
                          className="pagination-data"
                          showTotal={(total, range) =>
                            `Showing ${range[0]}-${range[1]} of ${total}`
                          }
                          onChange={PaginationChange}
                          total={products.length}
                          current={current}
                          pageSize={size}
                          showSizeChanger={false}
                          itemRender={PrevNextArrow}
                          onShowSizeChange={PerPageChange}
                        />
                        <div className="table-responsive">
                          <table className="table table-text-small mb-0">
                            <thead className="thead-primary table-sorting">
                              <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Description</th>
                                <th>Image</th>
                                <th>Quantity</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {getData(current, size).map((data, index) => {
                                return (
                                  <tr key={data.id}>
                                    <td>{index + 1}</td>
                                    <td>{data.name}</td>
                                    <td>{formattedPrice(data.price)}</td>
                                    <td>{data.description}</td>
                                    <td>
                                      <Image
                                        imagePath={data.url_image1}
                                        style={{ width: "100px" }}
                                      />
                                    </td>
                                    <td>{data.quantity}</td>
                                    <td style={{ display: "flex" }}>
                                      <button
                                        className="btn btn-warning"
                                        onClick={() => handleClickEdit(data.id)}
                                      >
                                        Sửa
                                      </button>
                                      <button
                                        className="btn btn-danger ml-2"
                                        onClick={() =>
                                          handleClickDelete(data.id)
                                        }
                                      >
                                        Xóa
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        <div className="table-filter-info">
                          <Pagination
                            className="pagination-data"
                            showTotal={(total, range) =>
                              `Showing ${range[0]}-${range[1]} of ${total}`
                            }
                            onChange={PaginationChange}
                            total={products.length}
                            current={current}
                            pageSize={size}
                            showSizeChanger={false}
                            itemRender={PrevNextArrow}
                            onShowSizeChange={PerPageChange}
                          />
                        </div>
                      </>
                    ) : (
                      <p>Không có dữ liệu</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <h2>Không có quyền truy cập</h2>
        )}
      </div>
    </>
  );
}

export default ManageProduct;
