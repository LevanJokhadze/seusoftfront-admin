import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import ItemForm from "./ItemForm";
import "./Dashboard.css";

const API_BASE_URL = process.env.REACT_APP_API_KEY;
const API_BASE_URL_Web = process.env.REACT_APP_API_Web;
const API_ADMIN_URL = process.env.REACT_APP_API_KEY_ADMIN;

const getToken = () => {
  return Cookies.get("token");
};

const axiosInstance = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState("en");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}show-links`);
      setData(response.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddItem = async (newItem) => {
    setData((prev) => [...prev, newItem]);
    setIsFormVisible(false);
  };

  const handleUpdateItem = async (updatedItem) => {
    setData((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
    setIsFormVisible(false);
    setIsEditMode(false);
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await axiosInstance.delete(`${API_ADMIN_URL}delete-product/${id}`);
        setData((prev) => prev.filter((item) => item.id !== id));
      } catch (error) {
        console.error("Error deleting item:", error);
        setError("Failed to delete item. Please try again.");
      }
    }
  };

  const handleEditItem = (item) => {
    setIsEditMode(true);
    setIsFormVisible(true);
    setCurrentItem(item);
  };

  const toggleFormVisibility = () => {
    setIsFormVisible((prev) => !prev);
    setIsEditMode(false);
    setCurrentItem(null);
  };

  const switchLanguage = (lang) => {
    setLanguage(lang);
  };

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="language-switcher">
        <button onClick={() => switchLanguage("en")}>English</button>
        <button onClick={() => switchLanguage("ge")}>Georgian</button>
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="item-list">
        {isLoading ? (
          <p>Loading...</p>
        ) : data.length > 0 ? (
          data.map((item) => (
            <div key={item.id} className="item">
              <h2>{language === "en" ? item.titleEn : item.titleGe}</h2>
              {(language === "en" ? item.bodyEn : item.bodyGe) ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: language === "en" ? item.bodyEn : item.bodyGe,
                  }}
                />
              ) : (
                <div className="multi-item-list">
                  {language === "en" &&
                    item.titlesEn.map((title, index) => (
                      <div key={index} className="multi-item">
                        <h3>{title}</h3>
                        {item.images && item.images[index] && (
                          <img
                            src={`${API_BASE_URL_Web}${item.images[index]}`}
                            alt={title}
                            className="im"
                          />
                        )}
                      </div>
                    ))}
                  {language === "ge" &&
                    item.titlesGe.map((title, index) => (
                      <div key={index} className="multi-item">
                        <h3>{title}</h3>
                        {item.images && item.images[index] && (
                          <img
                            src={`${API_BASE_URL_Web}${item.images[index]}`}
                            alt={title}
                            className="im"
                          />
                        )}
                      </div>
                    ))}
                </div>
              )}
              <div className="item-actions">
                <button onClick={() => handleEditItem(item)}>Edit</button>
                <button onClick={() => handleDeleteItem(item.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No items found.</p>
        )}
      </div>
      <button onClick={toggleFormVisibility} className="toggle-form-btn">
        {isFormVisible ? "Cancel" : "Add Item"}
      </button>
      {isFormVisible && (
        <ItemForm
          item={currentItem}
          onSubmit={isEditMode ? handleUpdateItem : handleAddItem}
          onCancel={toggleFormVisibility}
          isEditMode={isEditMode}
          language={language}
        />
      )}
    </div>
  );
};

export default Dashboard;
