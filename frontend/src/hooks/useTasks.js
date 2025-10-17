import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tasks from Firestore
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is logged in');
      }

      const userTasksRef = collection(db, `users/${user.uid}/tasks`);
      const querySnapshot = await getDocs(userTasksRef);

      const fetchedTasks = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTasks(fetchedTasks);
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks: ', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add new task
  const addTask = async (taskData) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is logged in');
      }

      const userTasksRef = collection(db, `users/${user.uid}/tasks`);
      const newTaskRef = await addDoc(userTasksRef, {
        ...taskData,
        createdDate: new Date().toISOString(),
        importance: false,
      });

      const newTask = { id: newTaskRef.id, ...taskData, importance: false };
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (err) {
      console.error('Error adding task: ', err);
      setError(err.message);
      throw err;
    }
  };

  // Update task
  const updateTask = async (taskId, updates) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is logged in');
      }

      const taskRef = doc(db, `users/${user.uid}/tasks/${taskId}`);
      await updateDoc(taskRef, updates);

      setTasks(prev =>
        prev.map(task =>
          task.id === taskId ? { ...task, ...updates } : task
        )
      );
    } catch (err) {
      console.error('Error updating task: ', err);
      setError(err.message);
      throw err;
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is logged in');
      }

      const taskRef = doc(db, `users/${user.uid}/tasks/${taskId}`);
      await deleteDoc(taskRef);

      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err) {
      console.error('Error deleting task: ', err);
      setError(err.message);
      throw err;
    }
  };

  // Toggle task completion
  const toggleComplete = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      await updateTask(taskId, { completed: !task.completed });
    }
  };

  // Toggle task importance
  const toggleImportance = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      await updateTask(taskId, { importance: !task.importance });
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    toggleImportance,
    refetch: fetchTasks,
  };
};
