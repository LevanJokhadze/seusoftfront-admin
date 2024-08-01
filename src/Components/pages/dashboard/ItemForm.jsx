import React, { useState } from 'react';
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

  const handleFileChange = async (index, file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axiosInstance.post(`${API_ADMIN_URL}upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFormData(prev => {
        const newImages = [...prev.images];
        newImages[index] = response.data.url;
        return { ...prev, images: newImages };
      });
    } catch (error) {
      console.error('Error uploading file:', error);
    }
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
      const data = {
        type: type ? 2 : 1,
        title: formData.title,
        body: formData.body,
        titles: JSON.stringify(formData.titles),
        images: JSON.stringify(formData.images),
      };
      
      const url = isEditMode 
        ? `${API_ADMIN_URL}edit-product/${item.id}`
        : `${API_ADMIN_URL}store-product`;
      
      const method = isEditMode ? 'put' : 'post';
      
      const response = await axiosInstance[method](url, data);
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
              {formData.images[index] && <span>{formData.images[index]}</span>}
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

export default ItemForm;
