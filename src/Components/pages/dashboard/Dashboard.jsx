import React, { useState, useEffect, useCallback } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ItemForm = ({ item, onSubmit, onCancel, isEditMode }) => {
  const [type, setType] = useState(false);

  const handleTypeChange = () => {
    setType(prevType => !prevType);
  };

  const [formData, setFormData] = useState({
    mainTitle: '',
    description: '',
    items: [{ title: '', file: null }]
  });

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleItemInputChange = (index, e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [name]: value };
      return { ...prev, items: newItems };
    });
  };

  const handleFileChange = (index, event) => {
    const file = event.target.files[0];
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], file: file };
      return { ...prev, items: newItems };
    });
  };

  const handleEditorChange = (content) => {
    setFormData(prevData => ({
      ...prevData,
      description: content
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { title: '', file: null }]
    }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!type) {
        const response = await axios.post(`${process.env.REACT_APP_API_KEY_ADMIN}store-product`, {
          type: 1,
          title: formData.mainTitle,
          body: formData.description
        });
        console.log('Response from server:', response.data);
      } else {
        const titles = formData.items.map(item => item.title);
        const images = formData.items.map(item => item.file ? item.file.name : '');
        const response = await axios.post(`${process.env.REACT_APP_API_KEY_ADMIN}store-product`, {
          title: formData.mainTitle,
          titles: titles,
          images: images
        });
        console.log('Response from server:', response.data);
      }
      
      onSubmit(formData);
    } catch (error) {
      console.error('Error sending data:', error);
      
      if (error.response) {
        console.error('Error data:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="checkbox" 
        checked={type}
        onChange={handleTypeChange}
        id="typeCheckbox"
      />
      <input
        type="text"
        name="mainTitle"
        value={formData.mainTitle}
        onChange={handleInputChange}
        placeholder="Main Title"
        required
      />
      {!type ? (
        <Editor
          apiKey={process.env.REACT_APP_TINYMCE_API_KEY}
          value={formData.description}
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
      ) : (
        <div>
          {formData.items.map((item, index) => (
            <div key={index}>
              <input
                type="text"
                name="title"
                value={item.title}
                onChange={(e) => handleItemInputChange(index, e)}
                placeholder={`Title ${index + 1}`}
                required
              />
              <input 
                type="file" 
                onChange={(e) => handleFileChange(index, e)}
                id={`fileUpload-${index}`}
              />
              <label htmlFor={`fileUpload-${index}`}>Choose file</label>
              {item.file && <span>{item.file.name}</span>}
              <button type="button" onClick={() => removeItem(index)}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={addItem}>Add Item</button>
        </div>
      )}
      <button type="submit">{isEditMode ? 'Update Item' : 'Add Item'}</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
};

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState({ mainTitle: '', description: '', items: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_KEY}show-links`);
      setData(response.data);
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

  const handleAddItem = useCallback(async (newItem) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_KEY}store-product`, newItem);
      setData(prev => ({ ...prev, data: [...prev.data, response.data] }));
      setIsFormVisible(false);
    } catch (error) {
      console.error('Error adding item:', error);
      setError('Failed to add item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleUpdateItem = useCallback(async (updatedItem) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${process.env.REACT_APP_API_KEY}update-product/${updatedItem.id}`, updatedItem);
      setData(prev => ({
        ...prev,
        data: prev.data.map(item => (item.id === updatedItem.id ? response.data : item))
      }));
      setIsFormVisible(false);
      setIsEditMode(false);
    } catch (error) {
      console.error('Error updating item:', error);
      setError('Failed to update item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleDeleteItem = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setIsLoading(true);
      setError(null);
      try {
        await axios.delete(`${process.env.REACT_APP_API_KEY}delete-product/${id}`);
        setData(prev => ({
          ...prev,
          data: prev.data.filter(item => item.id !== id)
        }));
      } catch (error) {
        console.error('Error deleting item:', error);
        setError('Failed to delete item. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  const handleEditItem = useCallback((item) => {
    setIsEditMode(true);
    setIsFormVisible(true);
    setCurrentItem(item);
  }, []);

  const toggleFormVisibility = useCallback(() => {
    setIsFormVisible(prev => !prev);
    setIsEditMode(false);
    setCurrentItem({ mainTitle: '', description: '', items: [{ title: '', file: null }] });
  }, []);

  return (
    <div>
      <div className="service">
        <h1>Dashboard</h1>
        {error && <div className="error-message">{error}</div>}
        <div className="current">
        {isLoading ? (
  <p>Loading...</p>
) : data && data.data && data.data.length > 0 ? (
  data.data.map(item => (
    <div key={item.id}>
      <h2>{item.title}</h2>
      {item.body ? (
        <div dangerouslySetInnerHTML={{ __html: item.body }} />
      ) : (
        <>
          {item.titles && Array.isArray(item.titles) && item.titles.map((title, index) => (
            <div key={index}>
              <h3>{title}</h3>
              {item.images && Array.isArray(item.images) && item.images[index] && (
                <p>Image: {item.images[index]}</p>
              )}
            </div>
          ))}
        </>
      )}
      <button onClick={() => handleEditItem(item)}>Edit</button>
      <button onClick={() => handleDeleteItem(item.id)}>Delete</button>
    </div>
  ))
) : (
  <p>No items found.</p>
)}
        </div>
        <button onClick={toggleFormVisibility} disabled={isLoading}>
          {isFormVisible ? 'Cancel' : 'Add Service'}
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
    </div>
  );
};

export default Dashboard;