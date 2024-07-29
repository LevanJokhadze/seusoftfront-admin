import React, { useState, useEffect, useCallback } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

const ItemForm = ({ item, onSubmit, onCancel, isEditMode }) => {
  const [formData, setFormData] = useState(item);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleEditorChange = useCallback((content, editor) => {
    setFormData(prev => ({ ...prev, description: content }));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  console.log(formData.description);
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="title"
        value={formData.title}
        onChange={handleInputChange}
        placeholder="Service Name"
        required
      />
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
      <button type="submit">{isEditMode ? 'Update Item' : 'Add Item'}</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
};

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState({ title: '', description: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/items`);
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
      const response = await axios.post(`${API_BASE_URL}/items`, newItem);
      setData(prev => [...prev, response.data]);
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
      const response = await axios.put(`${API_BASE_URL}/items/${updatedItem.id}`, updatedItem);
      setData(prev => prev.map(item => (item.id === updatedItem.id ? response.data : item)));
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
        await axios.delete(`${API_BASE_URL}/items/${id}`);
        setData(prev => prev.filter(item => item.id !== id));
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
    setCurrentItem({ title: '', description: '' });
  }, []);

  return (
    <div>
      <div className="service">
        <h1>Dashboard</h1>
        {error && <div className="error-message">{error}</div>}
        <div className="current">
          {isLoading ? (
            <p>Loading...</p>
          ) : data.length > 0 ? (
            data.map(item => (
              <div key={item.id}>
                <h2>{item.title}</h2>
                <div dangerouslySetInnerHTML={{ __html: item.description }} />
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