import React, { useEffect, useState } from "react";
import { API_URL } from "../../config";
import axios from "axios";
import { ReactSearchAutocomplete } from "react-search-autocomplete";
import { ToastContainer } from "react-toastify";
import { notifyError } from "./toastify";
import { Link } from "react-router-dom";

function Header() {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const role = localStorage.getItem("role");
  const lastname = localStorage.getItem("lastname");
  const firstname = localStorage.getItem("firstname");

  const [items, setItem] = useState([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    axios
      .get(`${API_URL}/api/get_products_data/`)
      .then((response) => {
        const data = response.data.data;
        let list = [];
        data.forEach((size, index) => {
          const item = {
            id: size.id,
            name: size.name,
          };
          list.push(item);
        });
        setItem(list);
      })
      .catch((e) => {
        if (e.response) {
          notifyError(e.response.data.message);
        }
      });
  }, []);

  const handleOnSearch = (string) => {
    if (string === searchText && string !== "") {
      window.location.href = `/search/${string}`;
    } else {
      setSearchText(string);
    }
  };

  const handleOnSelect = (item) => {
    window.location.href = `/detail/${item.id}`;
  };

  const formatResult = (item) => {
    return (
      <>
        <Link
          to={"/detail/" + item.id}
          style={{ display: "block", textAlign: "left", color: "black" }}
        >
          {item.name}
        </Link>
      </>
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
    localStorage.removeItem("firstname");
    localStorage.removeItem("lastname");
    localStorage.removeItem("email");
    localStorage.removeItem("address");
    localStorage.removeItem("phone");
    localStorage.removeItem("role");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("cart");
    localStorage.setItem("count", 0);

    window.location.href = "/";
  };

  const addClassToElement = () => {
    const element = document.getElementById("site-nav--mobile");
    if (element) {
      element.classList.add("active");
    }
  };

  const removeClassFromElement = () => {
    const element = document.getElementById("site-nav--mobile");
    if (element) {
      element.classList.remove("active");
    }
  };
  return (
    <>
      <header className="main-header">
        <div className="wrapper-header  header-transparent " id="themes-header">
          <div className="container">
            <div className="header-middle row-flex flex-flow-header">
              <div className="col-md-5 wrap-header-1 hidden-sm hidden-xs" />
              <div className="col-md-2 wrap-header-2 col-sm-6 col-xs-7">
                <div
                  className="main-header--logo fade-box"
                  itemScope=""
                  itemType="http://schema.org/Organization"
                >
                  <Link to="/">
                    <h1 className="logo">
                      <img
                        itemProp="logo"
                        src="/logo.png"
                        alt="SNEAKER.VN"
                        className="img-responsive logoimg lazyload"
                      />
                    </h1>
                  </Link>
                </div>
              </div>
              <div className="col-md-2 wrap-header-1 hidden-sm hidden-xs" />
              <div className="col-md-3 wrap-header-3 col-sm-6 col-xs-5">
                <div className="main-header--action row-flex">
                  <div
                    className="action--search"
                    id="site-search-handle"
                    style={{ width: "200px", zIndex: 9999 }}
                  >
                    <ReactSearchAutocomplete
                      items={items}
                      onSearch={handleOnSearch}
                      onSelect={handleOnSelect}
                      formatResult={formatResult}
                    />
                  </div>
                  <div
                    className="action--bar hamburger-menu hidden-lg hidden-md"
                    id="site-menu-handle"
                    onClick={addClassToElement}
                  >
                    <span className="bar"></span>
                  </div>
                </div>
              </div>
              <div className="col-md-12 wrap-header-4 hidden-sm hidden-xs">
                <div className="main-header--menu">
                  <nav className="navbar-mainmenu">
                    <ul className="list-mainmenu">
                      {role === "admin" && (
                        <li className="has-submenu ">
                          <a style={{ cursor: "pointer" }} title="Quản lí">
                            Quản lí
                            <i
                              className="fa fa-chevron-down"
                              aria-hidden="true"
                            />
                          </a>
                          <ul className="list-submenu">
                            <li className="">
                              <Link
                                to="/manage-product"
                                title="Quản lý sản phẩm"
                              >
                                Sản phẩm
                              </Link>
                            </li>
                          </ul>
                        </li>
                      )}
                      {!isLoggedIn ? (
                        <li className="has-submenu ">
                          <Link to="/login" title="Đăng nhập">
                            Đăng nhập
                          </Link>
                        </li>
                      ) : (
                        <li className="has-submenu ">
                          <Link title="Tài khoản">
                            {firstname + " " + lastname}
                            <i
                              className="fa fa-chevron-down"
                              aria-hidden="true"
                            />
                          </Link>
                          <ul className="list-submenu">
                            <li className="">
                              <a
                                onClick={handleLogout}
                                title="Đăng xuất"
                                style={{ cursor: "pointer" }}
                              >
                                Đăng xuất
                              </a>
                            </li>
                          </ul>
                        </li>
                      )}
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div id="site-nav--mobile" className="site-nav style--sidebar">
        <div id="site-navigation" className="site-nav-container">
          <div className="site-nav-container-last">
            <p className="title">Menu</p>
            <div className="main-navbar">
              <nav className="primary-menu">
                <ul className="menu-collection">
                  {role === "admin" && (
                    <li className="navi1 has-sub nav-level0">
                      <a style={{ cursor: "pointer" }} title="Quản lí">
                        Quản lí
                      </a>
                      <span className="icon-subnav">
                        <i className="fa fa-angle-down"></i>
                      </span>
                      <ul className="submenu subnav-children">
                        <li className="navi2">
                          <Link to="/manage-product" title="Quản lý sản phẩm">
                            Sản phẩm
                          </Link>
                        </li>
                      </ul>
                    </li>
                  )}
                  {!isLoggedIn ? (
                    <li className="navi1 ">
                      <Link to="/login" title="Đăng nhập">
                        Đăng nhập
                      </Link>
                    </li>
                  ) : (
                    <li className="navi1 has-sub nav-level0">
                      <Link title="Tài khoản">
                        {firstname + " " + lastname}
                      </Link>
                      <span className="icon-subnav">
                        <i className="fa fa-angle-down"></i>
                      </span>
                      <ul className="submenu subnav-children">
                        <li className="navi2">
                          <a
                            onClick={handleLogout}
                            title="Đăng xuất"
                            style={{ cursor: "pointer" }}
                          >
                            Đăng xuất
                          </a>
                        </li>
                      </ul>
                    </li>
                  )}
                </ul>
              </nav>
            </div>
          </div>
        </div>
        <button
          id="site-close-handle"
          className="site-close-handle"
          onClick={removeClassFromElement}
          title="Đóng"
        >
          <span className="hamburger-menu active" aria-hidden="true">
            <span className="bar animate"></span>
          </span>
        </button>
      </div>
      <ToastContainer />
    </>
  );
}

export default Header;
