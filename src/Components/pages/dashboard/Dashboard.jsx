import React, { useState, useEffect, useCallback } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import axios from 'axios';
import Cookies from 'js-cookie';
import './Dashboard.css';

const API_BASE_URL = process.env.REACT_APP_API_KEY;
const API_ADMIN_URL = process.env.REACT_APP_API_KEY_ADMIN;

const getToken = () => {
  return Cookies.get('token'); 
};

// Axios instance with default headers
const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const ItemForm = ({ item, onSubmit, onCancel, isEditMode }) => {
  const [type, setType] = useState(item?.type === 2);
  const [formData, setFormData] = useState({
    title: item?.title || '',
    body: item?.body || '',
    titles: item?.titles || [''],
    images: item?.images || [null]
  });

  const handleTypeChange = () => setType(!type);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTitleChange = (index, value) => {
    setFormData(prev => {
      const newTitles = [...prev.titles];
      newTitles[index] = value;
      return { ...prev, titles: newTitles };
    });
  };

  const handleFileChange = (index, file) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      newImages[index] = file;
      return { ...prev, images: newImages };
    });
  };

  const handleEditorChange = (content) => {
    setFormData(prev => ({ ...prev, body: content }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      titles: [...prev.titles, ''],
      images: [...prev.images, null]
    }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      titles: prev.titles.filter((_, i) => i !== index),
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const formDataToSend = new FormData();
        formDataToSend.append('type', type ? '2' : '1');
        formDataToSend.append('title', formData.title);

        if (!type) {
            formDataToSend.append('body', formData.body);
        } else {
            formDataToSend.append('titles', JSON.stringify(formData.titles));
            formData.images.forEach((file, index) => {
                if (file instanceof File) {
                    formDataToSend.append(`images[${index}]`, file);
                }
            });
        }

        if (isEditMode) {
            formDataToSend.append('id', item.id);
        }
        
        const url = isEditMode 
            ? `${API_ADMIN_URL}edit-product/${item.id}`
            : `${API_ADMIN_URL}store-product`;
        
        const method = isEditMode ? 'put' : 'post';
        
        const token = getToken();
        const response = await axiosInstance[method](url, formDataToSend, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            },
        });
        console.log('Data sent:', formDataToSend);
        console.log('Response from server:', response.data);
        onSubmit(response.data);
    } catch (error) {
        console.error('Error sending data:', error);
    }
};


  return (
    <form onSubmit={handleSubmit} className="item-form">
      <div className="form-group">
        <label htmlFor="typeCheckbox">Multiple Items</label>
        <input 
          type="checkbox" 
          checked={type}
          onChange={handleTypeChange}
          id="typeCheckbox"
        />
      </div>
      <div className="form-group">
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Main Title"
          required
        />
      </div>
      {!type ? (
        <div className="form-group">
          <Editor
          apiKey={process.env.REACT_APP_TINYMCE_API_KEY}
            value={formData.body}
          init={{
            plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount checklist mediaembed casechange export formatpainter pageembed linkchecker a11ychecker tinymcespellchecker permanentpen powerpaste advtable advcode editimage advtemplate ai mentions tinycomments tableofcontents footnotes mergetags autocorrect typography inlinecss markdown',
            toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
            tinycomments_mode: 'embedded',
            tinycomments_author: 'Author name',
            mergetags_list: [
              { value: 'First.Name', title: 'First Name' },
              { value: 'Email', title: 'Email' },
            ],
            ai_request: (request, respondWith) => respondWith.string(() => Promise.reject("See docs to implement AI Assistant")),
          }}
          onEditorChange={handleEditorChange}
          onInit={(evt, editor) => {
            console.log('Editor is ready to use!', editor);
          }}
        />
        </div>
      ) : (
        <div className="multi-item-container">
          {formData.titles.map((title, index) => (
            <div key={index} className="multi-item">
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(index, e.target.value)}
                placeholder={`Title ${index + 1}`}
                required
              />
              <input 
                type="file" 
                onChange={(e) => handleFileChange(index, e.target.files[0])}
                id={`fileUpload-${index}`}
              />
              <label htmlFor={`fileUpload-${index}`}>Choose file</label>
              {formData.images[index] && <span>{formData.images[index].name}</span>}
              <button type="button" onClick={() => removeItem(index)}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={addItem} className="add-item-btn">Add Item</button>
        </div>
      )}
      <div className="form-actions">
        <button type="submit">{isEditMode ? 'Update Item' : 'Add Item'}</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}show-links`);
      setData(response.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddItem = async (newItem) => {
    setData(prev => [...prev, newItem]);
    setIsFormVisible(false);
  };
  
  const handleUpdateItem = async (updatedItem) => {
    setData(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    setIsFormVisible(false);
    setIsEditMode(false);
  };
  
  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axiosInstance.delete(`${API_ADMIN_URL}delete-product/${id}`);
        setData(prev => prev.filter(item => item.id !== id));
      } catch (error) {
        console.error('Error deleting item:', error);
        setError('Failed to delete item. Please try again.');
      }
    }
  };

  const handleEditItem = (item) => {
    setIsEditMode(true);
    setIsFormVisible(true);
    setCurrentItem(item);
  };

  const toggleFormVisibility = () => {
    setIsFormVisible(prev => !prev);
    setIsEditMode(false);
    setCurrentItem(null);
  };

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      {error && <div className="error-message">{error}</div>}
      <div className="item-list">
        {isLoading ? (
          <p>Loading...</p>
        ) : data.length > 0 ? (
          data.map(item => (
            <div key={item.id} className="item">
              <h2>{item.title}</h2>
              {item.body ? (
                <div dangerouslySetInnerHTML={{ __html: item.body }} />
              ) : (
                <div className="multi-item-list">
                  {item.titles && item.titles.map((title, index) => (
                    <div key={index} className="multi-item">
                      <h3>{title}</h3>
                      {item.images && item.images[index] && (
                        <img src={item.images[index]} alt={title} />
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className="item-actions">
                <button onClick={() => handleEditItem(item)}>Edit</button>
                <button onClick={() => handleDeleteItem(item.id)}>Delete</button>
              </div>
            </div>
          ))
        ) : (
          <p>No items found.</p>
        )}
      </div>
      <button onClick={toggleFormVisibility} className="toggle-form-btn">
        {isFormVisible ? 'Cancel' : 'Add Item'}
      </button>
      {isFormVisible && (
        <ItemForm
          item={currentItem}
          onSubmit={isEditMode ? handleUpdateItem : handleAddItem}
          onCancel={toggleFormVisibility}
          isEditMode={isEditMode}
        />
      )}
    </div>
  );
};

export default Dashboard;