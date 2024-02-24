import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "../../config";
import "./loading.css";
import { notifyError, notifySuccess } from "../common/toastify";
import { Link } from "react-router-dom";

function Login() {
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  if (isLoggedIn) {
    window.location.href = "/";
  }
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      if (username === "" || password === "") {
        notifyError("Vui lòng nhập đầy đủ thông tin");
        return;
      }
      if (password.length < 8) {
        notifyError("Vui lòng nhập mật khẩu với ít nhất 8 kí tự");
        return;
      }
      const response = await axios.post(`${API_URL}/api/login/`, {
        username: username,
        password: password,
      });

      if (response.status === 200) {
        localStorage.setItem("user_id", response.data.user.id);
        localStorage.setItem("username", response.data.user.username);
        localStorage.setItem("firstname", response.data.user.firstname);
        localStorage.setItem("lastname", response.data.user.lastname);
        localStorage.setItem("email", response.data.user.email);
        localStorage.setItem("address", response.data.user.address);
        localStorage.setItem("phone", response.data.user.phone);
        localStorage.setItem("role", response.data.roleName);
        localStorage.setItem("isLoggedIn", true);
        notifySuccess("Đăng nhập thành công");
        window.location.href = "/";
      } else {
        notifyError("Đăng nhập không thành công");
      }
    } catch (error) {
      console.log(error);
      if (error.response) {
        notifyError(error.response.data.message);
      }
    }
  };

  return (
    <>
      <>
        <main className="mainContent-theme ">
          <div className="layout-account">
            <div className="container">
              <div className="row">
                <div className="col-md-6 col-xs-12 wrapbox-heading-account">
                  <div className="header-page clearfix">
                    <h1>Đăng nhập</h1>
                  </div>
                </div>
                <div className="col-md-6 col-xs-12 wrapbox-content-account">
                  <div id="customer-login">
                    <div id="login" className="userbox">
                      <div className="clearfix large_form">
                        <label htmlFor="customer_email" className="icon-field">
                          <i className="icon-login icon-envelope " />
                        </label>
                        <input
                          required
                          type="text"
                          name="customer[email]"
                          id="customer_email"
                          placeholder="Tên đăng nhập"
                          className="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                        />
                      </div>
                      <div className="clearfix large_form">
                        <label
                          htmlFor="customer_password"
                          className="icon-field"
                        >
                          <i className="icon-login icon-shield" />
                        </label>
                        <input
                          required
                          type="password"
                          name="customer[password]"
                          id="customer_password"
                          placeholder="Mật khẩu"
                          className="text"
                          size={16}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                      <div className="clearfix action_account_custommer">
                        <div className="">
                          <button
                            className="btn btn-primary"
                            onClick={handleLogin}
                          >
                            ĐĂNG NHẬP
                          </button>
                        </div>
                        <div className="">
                          <Link to="/register" title="Đăng ký">
                            Đăng ký
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </>
    </>
  );
}

export default Login;
