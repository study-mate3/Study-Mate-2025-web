import { useEffect, useState } from "react";
import SidePanel from "../components/SidePanel";
import { 
  StarIcon,
  ArrowRightIcon, 
  CalendarIcon, 
  PlusCircleIcon,
  CheckCircleIcon,
  CalendarDaysIcon

} from "@heroicons/react/24/solid";

import { collection, addDoc, query, where, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";


import PropTypes from 'prop-types';

// TaskCard component for each task
const TaskCard = ({ task, index, handleDelete, handleComplete, handleImportance, handleEditTask, handleUpdateTask }) => {
  return (
    <div className="bg-gray-200 px-4 py-2 mb-2 rounded-[15px] shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[25px] font-semibold">{task.description}</div>
        <div className="px-2 py-1 flex items-center justify-between w-auto bg-blue-700 rounded-full
        space-x-2">
          <p className="font-semibold text-[12px] text-white">Mark as Completed</p>
          <input
          type="checkbox"
          checked={task.completed}
          onChange={() => handleComplete(task.id)}
          className="w-4 h-4"
        />
      </div>
        
      </div>
      <div className="space-y-2">
        <div className="flex">
          <p className="w-32"><strong>List:</strong></p>
          <p className="flex-1 text-left ml-6">{task.list}</p>
        </div>
        
        <div className="flex">
          <p className="w-32"><strong>Due Date:</strong></p>
          <p className="flex-1 text-left ml-6">{task.dueDate}</p>
        </div>
        
        <div className="flex">
          <p className="w-32"><strong>Priority Level:</strong></p>
          <p className="flex-1 text-left ml-6">{task.priority}</p>
        </div>
        
        <div className="flex">
          <p className="w-32"><strong>Sub-tasks:</strong></p>
          <p className="flex-1 text-left ml-6">{task.subTasks}</p>
        </div>
      </div>

      <div className="flex gap-3 justify-end">

        <button onClick={() => handleImportance(task.id)} className={task.importance ? "text-amber-500" : "text-black"}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill={task.importance ? "currentColor" : "none"}
            viewBox="0 0 24 24" 
            strokeWidth="1.5" 
            stroke="currentColor" 
            className="size-6"
          >
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
          </svg>
        </button>

        <button onClick={() => handleEditTask(task.id)} className="cursor-pointer">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="currentColor" 
            className="size-6"
          >
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
        </button>
        
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          strokeWidth={1.5} 
          stroke="currentColor" 
          className="size-6 cursor-pointer" 
          onClick={() => handleDelete(task.id)}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
      </div>
    </div>
  );
};

TaskCard.propTypes = {
  task: PropTypes.shape({
    description: PropTypes.string.isRequired,
    list: PropTypes.string.isRequired,
    dueDate: PropTypes.string.isRequired,
    subTasks: PropTypes.string.isRequired,
    priority: PropTypes.string.isRequired,
    completed: PropTypes.bool.isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
  handleDelete: PropTypes.func.isRequired,
  handleComplete: PropTypes.func.isRequired,
  handleImportance: PropTypes.func.isRequired,
};

const ToDoListPage = () => {
  const today = new Date().toISOString().split("T")[0];
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    description: "",
    list: "Personal",
    dueDate: "",
    subTasks: "",
    priority: "low",
    completed: false,
  });

  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState("all");



  // Function to fetch tasks from Firestore
  const fetchTasks = async () => {
    try {
      const user = auth.currentUser; // Get logged-in user
      if (!user) {
        console.error("No user is logged in");
        return;
      }

      const userTasksRef = collection(db, `users/${user.uid}/tasks`); // User's tasks subcollection
      const querySnapshot = await getDocs(userTasksRef);

      const fetchedTasks = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTasks(fetchedTasks); // Update the state with fetched tasks
    } catch (error) {
      console.error("Error fetching tasks: ", error);
    }
  };

  useEffect(() => {
    fetchTasks(); // Fetch tasks when the component mounts
  }, []);

  const [listOptions, setListOptions] = useState(['Personal', 'Work', 'Study']);
  const [newOption, setNewOption] = useState('');

  // Handle task addition
  const addTask = async () => {
    if (newTask.description.trim() !== "") {
      try {
        const user = auth.currentUser; // Get the currently logged-in user
        if (!user) {
          console.error("No user is logged in");
          return;
        }
  
        const userTasksRef = collection(db, `users/${user.uid}/tasks`); // Reference to user's tasks subcollection
        
        // Add the new task to Firestore
        const newTaskRef = await addDoc(userTasksRef, {
          ...newTask,
          createdDate: new Date().toISOString(),
        });
  
        console.log("Task added to Firestore successfully!");
  
        // Add the new task to local state
        setTasks([...tasks, { id: newTaskRef.id, ...newTask }]);
  
        // Clear the input fields
        setNewTask({
          description: "",
          list: "Personal",
          dueDate: "",
          subTasks: "",
          priority: "low",
          completed: false,
        });
      } catch (error) {
        console.error("Error adding task: ", error);
      }
    }
  };
  

  const handleDelete = async (taskId) => {
    try {
      const user = auth.currentUser;
      const taskRef = doc(db, `users/${user.uid}/tasks/${taskId}`);
      await deleteDoc(taskRef);
  
      setTasks(tasks.filter((task) => task.id !== taskId));
      console.log("Task deleted successfully!");
    } catch (error) {
      console.error("Error deleting task: ", error);
    }
  };
  
  const handleComplete = async (taskId) => {
    try {
      const user = auth.currentUser;
      const taskRef = doc(db, `users/${user.uid}/tasks/${taskId}`);
      const updatedTask = tasks.find((task) => task.id === taskId);
      await updateDoc(taskRef, { completed: !updatedTask.completed });
  
      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        )
      );
      console.log("Task status updated!");
    } catch (error) {
      console.error("Error updating task: ", error);
    }
  };
  
  const handleImportance = async (taskId) => {
    try {
      const user = auth.currentUser;
  
      if (!user) {
        console.error("No user is logged in");
        return;
      }
  
      // Reference to the specific task document
      const taskRef = doc(db, `users/${user.uid}/tasks/${taskId}`);
      const updatedTask = tasks.find((task) => task.id === taskId);
  
      if (!updatedTask) {
        console.error("Task not found");
        return;
      }
  
      // Toggle the importance status
      const newImportanceStatus = !updatedTask.importance;
  
      // Update Firestore
      await updateDoc(taskRef, { importance: newImportanceStatus });
  
      // Update the local state
      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, importance: newImportanceStatus } : task
        )
      );
  
      console.log("Task importance status updated!");
    } catch (error) {
      console.error("Error updating task importance: ", error);
    }
  };

  const handleEditTask = (taskId) => {
    const taskToEdit = tasks.find((task) => task.id === taskId);
    setEditingTask(taskToEdit);
    setNewTask({
      description: taskToEdit.description,
      list: taskToEdit.list,
      dueDate: taskToEdit.dueDate,
      subTasks: taskToEdit.subTasks,
      priority: taskToEdit.priority,
      completed: taskToEdit.completed,
    });
  };
  

  const handleUpdateTask = async () => {
    if (!editingTask || editingTask.description.trim() === "") {
      console.error("Task description cannot be empty");
      return;
    }
  
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error("No user is logged in");
        return;
      }
  
      
      console.log("Editing task details:", editingTask);

      const taskRef = doc(db, `users/${user.uid}/tasks/${editingTask.id}`);
      console.log("Updating Firestore document:", taskRef.path);

      await updateDoc(taskRef, {
        description: editingTask.description,
        list: editingTask.list,
        dueDate: editingTask.dueDate,
        subTasks: editingTask.subTasks,
        priority: editingTask.priority,
        completed: editingTask.completed,
      });
      
      setTasks(tasks.map((task) =>
        task.id === editingTask.id ? editingTask : task
      ));
  
      setEditingTask(null);
      setNewTask({
        description: "",
        list: "Personal",
        dueDate: "",
        subTasks: "",
        priority: "low",
        completed: false,
      });
  
      console.log("Task updated successfully!");
    } catch (error) {
      console.error("Error updating task: ", error);
    }
  };

  const getFilteredTasks = () => {
    
    
    switch (filter) {
      case "upcoming":
        return tasks.filter(task => task.dueDate > today && !task.completed);
      case "today":
        return tasks.filter(task => task.dueDate === today && !task.completed);
      case "completed":
        return tasks.filter(task => task.completed);
      case "important":
        return tasks.filter(task => task.importance);
      default:
        return tasks; // Show all tasks
    }
  };
  

  // Handle adding new list option
  const handleAddOption = () => {
    if (newOption && !listOptions.includes(newOption)) {
      setListOptions([...listOptions, newOption]);
      setNewOption('');
    }
  };

  const sidePanelStyle = {
    position: 'fixed', // Fixes the panel position
    left: -10,
    top: '200px',
        }

  return (
    <div>

<div className="text-[30px] font-bold text-center mb-8 mt-8  text-headingColor">
        <h2 >
        Manage Your To-Do List
      </h2>
        </div>

<div className="flex h-[83.333vh] justify-between pl-20">

{/* 1st Column: Navigation Panel */}
<div style={sidePanelStyle}>
        <SidePanel/>
      </div>

{/* 2nd Column: Task Tracker */}
<div className="w-[250px] bg-blue-200 rounded-[15px] flex flex-col space-y-3 ">
  <div className="w-full">
    <h2 className="text-lg font-semibold mt-2 ml-4">Tasks</h2>
    <div 
     className="w-full py-2 flex hover:bg-blue-500/80 hover:text-blue-950"
     onClick={() => setFilter("upcoming")}
    >
      <ArrowRightIcon className="h-6 w-6 text-gray-600 ml-4 mr-2" />
      <p className="font-semibold text-gray-600 ">Upcoming</p>
      <p className="ml-auto mr-4 font-semibold">
        {tasks.filter(task => task.dueDate > today && !task.completed).length}
      </p>
    </div>
    <div 
     className="w-full py-2 flex hover:bg-blue-500/80"
     onClick={() => setFilter("today")}
    >
      <CalendarIcon className="h-6 w-6 text-gray-600 ml-4 mr-2" />
      <p className="font-semibold text-gray-600">Today</p>
      <p className="ml-auto mr-4 font-semibold">
        {tasks.filter(task => task.dueDate === today && !task.completed).length}
      </p>
    </div>
    <div className="w-full py-2 flex space-x-2 hover:bg-blue-500/80">
      <CalendarDaysIcon className="h-6 w-6 text-gray-600 ml-4 mr-2" />
      <p className="font-semibold text-gray-600">Calender</p>
    </div>
  </div>

  <div className="w-full">
    <h2 className="text-lg font-semibold mt-2 ml-4">Lists</h2>
    <div className="w-full py-2 flex items-center hover:bg-blue-500/80 ">
      <div className="w-5 h-5 mr-2 bg-pink-600 ml-4 rounded"></div>
      <p className="font-semibold text-gray-600 hover:text-blue-950">Personal</p>
      <p className="ml-auto mr-4 font-semibold">8</p>
    </div>
    <div className="w-full py-2 flex items-center hover:bg-blue-500/80">
      <div className="w-5 h-5 mr-2 bg-yellow-500 ml-4 rounded"></div>
      <p className="font-semibold text-gray-600">Work</p>
      <p className="ml-auto mr-4 font-semibold">4</p>
    </div>
    <div className="w-full py-2 flex space-x-2 hover:bg-blue-500/80">
    <PlusCircleIcon className="h-6 w-6 text-gray-600 ml-4 mr-2" />
      <p className="font-semibold text-gray-600">Add New List</p>
    </div>
  </div>

  <div className="w-full">
    <div 
     className="w-full py-2 flex space-x-2 hover:bg-blue-500/80 hover:text-blue-950"
     onClick={() => setFilter("important")}
    >
      <StarIcon className="h-6 w-6 text-gray-600 ml-4 mr-2" />
      <p className="font-semibold text-gray-600 ">Important Tasks</p>
    </div>
    <div 
     className="w-full py-2 flex space-x-2 hover:bg-blue-500/80"
     onClick={() => setFilter("completed")}
    >
      <CheckCircleIcon className="h-6 w-6 text-gray-600 ml-4 mr-2" />
      <p className="font-semibold text-gray-600">Completed Tasks</p>
    </div>
  </div>
</div>

{/* 3rd Column: Task Cards (Scrollable) */}
<div className="w-[500px] bg-gray-50 p-4 overflow-y-auto">
<h2 className="text-lg font-semibold mb-4">
  {filter === "all" ? "All Tasks" : `Showing: ${filter.charAt(0).toUpperCase() + filter.slice(1)} Tasks`}
</h2>

  <div className="space-y-4">
    {getFilteredTasks().length === 0 ? (
      <p>No tasks available for this category.</p>
    ) : (
      getFilteredTasks().map((task, index) => (
        <TaskCard
          key={task.id}
          task={task}
          index={index}
          handleDelete={handleDelete}
          handleComplete={handleComplete}
          handleImportance={handleImportance}
          handleEditTask={handleEditTask}
        />
      ))
    )}
  </div>

</div>

{/* 4th Column: Form to Set Tasks */}
<div className="w-[350px] bg-white p-4 flex flex-col border-2 border-blue-950/80
mr-[20px] rounded-[15px]">

  <div className="flex items-center px-3 w-full p-2 border-[1.5px] border-black/50 bg-gray-200 rounded-md 
    text-lg font-semibold ">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" 
    className="size-5 mr-3 text-gray-500">
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
    <h2 className="text-gray-500">
      Set Your Tasks
    </h2>
  </div>
    
  <div>
    <h2 className="mt-3 mb-2 font-bold">Description</h2>
    <textarea
      className="w-full h-24 p-2 border bg-gray-200 border-gray-300 rounded focus:outline-none 
      focus:ring-2 focus:ring-gray-500"
      placeholder="+ Add a Description about the Task"
      value={newTask.description}
      onChange={(e) => {
        setNewTask({ ...newTask, description: e.target.value });
        if (editingTask) {
          setEditingTask({ ...editingTask, description: e.target.value });
        }
      }}
    />
  </div>

  <div className="w-full mt-4 ">
    <div className="flex items-center mb-3">
      <div className="w-1/2 items-center">
        <p className="block font-bold mb-2">List</p>
      </div>
      <div className="w-1/2 flex items-center">
        <select 
        className="w-auto px-3 py-1 border bg-gray-200 border-gray-300 rounded-md focus:outline-none 
        focus:ring-2 focus:ring-blue-500"
        value={newTask.list}
        onChange={(e) => {
          setNewTask({ ...newTask, list: e.target.value });
          if (editingTask) {
            setEditingTask({ ...editingTask, list: e.target.value });
          }
        }}
        >
          {listOptions.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>


    <div className="flex items-center mb-3">
      <div className="w-1/2 flex items-center">
        <p className="block font-bold mb-2">Due Date</p>
      </div>
      <div className="w-1/2 flex items-center">
        <input 
          type="date" 
          className="block w-full p-2 border bg-gray-200 border-gray-300 rounded-md shadow-sm 
          focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-400"
          value={newTask.dueDate}
          onChange={(e) => {
            setNewTask({ ...newTask, dueDate: e.target.value });
            if (editingTask) {
              setEditingTask({ ...editingTask, dueDate: e.target.value });
            }
          }}
        />
      </div> 
    </div>

    <div className="flex items-center mb-3">
      <div className="w-1/2 flex items-center">
        <p className="block font-bold mb-2">Sub Tasks</p>
      </div>
      <div className="w-1/2 flex items-center">
        <input 
          type="text" 
          placeholder="+ Add a subtask" 
          className="block w-full p-2 border bg-gray-200 border-gray-300 rounded-md shadow-sm 
          focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={newTask.subTasks}
          onChange={(e) => {
            setNewTask({ ...newTask, subTasks: e.target.value });
            if (editingTask) {
              setEditingTask({ ...editingTask, subTasks: e.target.value });
            }
          }}
        />
      </div>
    </div>

    <div className="flex items-center mb-3">
      <div className="w-1/2">
        <p className="block font-bold mb-2">Prioritized Level</p>
      </div>
      <div className="w-1/2 flex items-center">
        <select 
          className="block w-full p-2 border bg-gray-200 border-gray-300 rounded-md shadow-sm 
          focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={newTask.priority}
          onChange={(e) => {
            setNewTask({ ...newTask, priority: e.target.value });
            if (editingTask) {
              setEditingTask({ ...editingTask, priority: e.target.value });
            }
          }}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
    </div>
  </div>

  {/* Add Task Button */}
  <button
    className="w-[40%] mx-auto px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 mt-4 justify-end"
    onClick={editingTask ? handleUpdateTask : addTask}
  >
    {editingTask ? "Update Task" : "Add Task"}
  </button>


</div>

</div>

    </div>
   
  );
};

export default ToDoListPage;