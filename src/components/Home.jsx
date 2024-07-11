import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

function Home() {
  const apiUrl = process.env.REACT_APP_API_URL;

  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: '',
  });

    // Calculate current tasks to display based on pagination
    const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of tasks to display per page

  // Calculate current tasks to display based on pagination
  const indexOfLastTask = currentPage * itemsPerPage;
  const indexOfFirstTask = indexOfLastTask - itemsPerPage;
  const currentTasks = tasks.slice(indexOfFirstTask, indexOfLastTask);

  // Handle previous page click
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handle next page click
  const handleNextPage = () => {
    if (indexOfLastTask < tasks.length) {
      setCurrentPage(currentPage + 1);
    }
  };
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token'); // Retrieve token from local storage
        const response = await axios.get(`http://localhost:5000/tasks`);
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, [apiUrl]);

  // operation 

  const DeleteTask = async (taskId) => {
    console.log('Deleting task with ID:', taskId); // Debugging: Check taskId
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this task!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:5000/tasks/${taskId}`);
          setTasks(tasks.filter(task => task._id !== taskId));
          Swal.fire('Deleted!', 'Your task has been deleted.', 'success');
        } catch (error) {
          console.error('Error deleting task:', error);
          Swal.fire('Error!', 'Failed to delete task.', 'error');
        }
      }
    });
  };

  const TaskEdit = (task) => {
    setEditingTask(task._id);
    setFormData({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate.split('T')[0],  
      priority: task.priority,
    });
  };

  const formChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:5000/tasks/${editingTask}`, formData);
      setTasks(tasks.map(task => (task._id === editingTask ? response.data : task)));
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        priority: '',
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  return (
    <div className="bg-indigo-100 min-h-screen p-6">
<div className="bg-indigo-400 p-4 w-full mb-4 rounded shadow flex justify-between items-center">
  <h1 className='text-xl font-bold text-white'>Task Manager</h1>
  <Link to="/createtask">
    <button className="font-bold text-white bg-indigo-600 hover:bg-indigo-700 py-2 px-4 rounded">
      Create Task
    </button>
  </Link>
</div>

   
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded">
        <thead className="bg-indigo-800 text-white">
          <tr>
          <th className=" px-4 py-2">S.No</th>
            <th className="w-1/3 px-4 py-2">Title</th>
            <th className="w-1/3 px-4 py-2">Description</th>
            <th className="w-1/6 px-4 py-2">Due Date</th>
            <th className="w-1/6 px-4 py-2">Priority</th>
            <th className="w-1/6 px-4 py-2">Status</th>
            <th className="w-1/6 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentTasks.map((task,index) => (
            <tr key={task._id} className="text-center border-b">
            <td className="px-4 py-2">{index+1}</td>
              <td className="px-4 py-2">{task.title}</td>
              <td className="px-4 py-2">{task.description}</td>
              <td className="px-4 py-2">{new Date(task.dueDate).toLocaleDateString()}</td>
              <td className="px-4 py-2">{task.priority}</td>
              <td className="px-4 py-2">{task.status}</td>
              <td className="px-4 py-2 flex">
                  <button
                    onClick={() => TaskEdit(task)}
                    className="text-blue-500 hover:underline mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => DeleteTask(task._id)} // Ensure task._id is defined here
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              <td>
             
              </td>
            </tr>
          ))}
        </tbody>
        {editingTask && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
    <div className="bg-white p-4 rounded shadow-md w-full md:max-w-md">
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        onClick={() => setEditingTask(null)}
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
      <h2 className="text-xl font-bold mb-4">Edit Task</h2>
      <form onSubmit={handleFormSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={formChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={formChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Due Date</label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={formChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Priority</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={formChange}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
           className="border-indigo-600 border text-indigo-500 py-2 px-4 rounded hover:bg-indigo-700"
            onClick={() => setEditingTask(null)}
          >
            Close
          </button>
          <button
            type="submit"
            className="bg-indigo-600 p-2 ml-2 text-white py-2 px-4 rounded hover:bg-indigo-700"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      </table>
      <div className='flex justify-end mt-4'>
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`bg-indigo-600 text-white py-2 px-4 rounded mr-2 ${
            currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
          }`}
        >
          Previous
        </button>
        <button
          onClick={handleNextPage}
          disabled={indexOfLastTask >= tasks.length}
          className={`bg-indigo-600 text-white py-2 px-4 rounded ${
            indexOfLastTask >= tasks.length
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-indigo-700'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  </div>
);
}

export default Home;
