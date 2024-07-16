import React, { useState, useEffect } from 'react';
import { getData, addItem, updateItem, deleteItem } from '../../../services/apiService'; 

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [newItem, setNewItem] = useState({ title: '', description: '' });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItemId, setCurrentItemId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getData();
        setData(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: value });
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const addedItem = await addItem(newItem);
      setData([...data, addedItem]);
      setNewItem({ title: '', description: '' });
      setIsFormVisible(false); 
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleEditItem = (item) => {
    setIsEditMode(true);
    setIsFormVisible(true);
    setNewItem({ title: item.title, description: item.description });
    setCurrentItemId(item.id);
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    try {
      const updatedItem = await updateItem(currentItemId, newItem);
      setData(data.map(item => (item.id === currentItemId ? updatedItem : item))); 
      setNewItem({ title: '', description: '' }); 
      setIsFormVisible(false); 
      setIsEditMode(false);
      setCurrentItemId(null);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await deleteItem(id);
      setData(data.filter(item => item.id !== id)); 
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const toggleFormVisibility = () => {
    setIsFormVisible(!isFormVisible);
    setIsEditMode(false);
    setNewItem({ title: '', description: '' });
  };

  return (
    <div>
      <div className="service">
        <h1>Dashboard</h1>
        <div className="current">
          {data.length > 0 ? (
            data.map(item => (
              <div key={item.id}>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
                <button onClick={() => handleEditItem(item)}>Edit</button>
                <button onClick={() => handleDeleteItem(item.id)}>Delete</button>
              </div>
            ))
          ) : (
            <p>Loading data...</p>
          )}
        </div>
        <button onClick={toggleFormVisibility}>
          {isFormVisible ? 'Cancel' : 'Add Service'}
        </button>
        {isFormVisible && (
          <form onSubmit={isEditMode ? handleUpdateItem : handleAddItem}>
            <input
              type="text"
              name="title"
              value={newItem.title}
              onChange={handleInputChange}
              placeholder="Title"
              required
            />
            <input
              type="text"
              name="description"
              value={newItem.description}
              onChange={handleInputChange}
              placeholder="Description"
              required
            />
            <button type="submit">{isEditMode ? 'Update Item' : 'Add Item'}</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
