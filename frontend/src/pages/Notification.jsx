import React, { useEffect, useState } from 'react';
import { Bell, Trash2, Check, Circle, ArrowLeft, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { db } from '../firebase/firebaseConfig';
import { doc,getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import SidePanel from '../components/SidePanel';
import logo2 from '/whitelogo.png'


const Notification = () => {
  // Sample notification data - replace with your actual data
  const [notifications, setNotifications] = useState([]);
  const sidePanelStyle = {
    position: 'fixed',
    left: -10,
    top: '200px',
  };
    const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (!currentUser) {
          console.error("No user logged in");
          setLoading(false);
          return;
        }

        // Step 1: Get user role from 'users' collection
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          console.error("User document not found");
          setLoading(false);
          return;
        }

        const userRole = userDocSnap.data().role; // should be 'student' or 'parent'
        const recipientType = userRole === "student" ? "students" : "parents";

        // Step 2: Get notifications matching the recipient type
        const notificationsQuery = query(
          collection(db, "notifications"),
          where("recipientType", "==", recipientType)
        );

        const querySnapshot = await getDocs(notificationsQuery);
        const fetchedNotifications = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        }));

        setNotifications(fetchedNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showActions, setShowActions] = useState(null);

  const filterNotifications = (filter) => {
    setSelectedFilter(filter);
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
    setShowActions(null);
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
    setShowActions(null);
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const getFilteredNotifications = () => {
    switch (selectedFilter) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'read':
        return notifications.filter(n => n.read);
      default:
        return notifications;
    }
  };

  const getTypeStyles = (type) => {
    switch (type) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'important':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }

    
  };

  return (
    <div className="min-h-screen bg-gray-50">
        <div style={sidePanelStyle}>
         <SidePanel/>
        </div>
      {/* Header */}
      <div className="fixed top-0 left-0 w-full bg-blue-500 p-3 z-40 shadow-md">
          <div className="absolute top-3 left-4">
                  <img
                    src={logo2}
                    alt="Logo"
                    className="lg:w-[160px] w-[80px] md:w-[100px] h-auto "
                  />
                </div>
                 <div className="flex items-center justify-center">
         <h2 className="lg:text-[30px] text-[20px] font-bold text-white mr-2">
        Notifications
        </h2>
        <img src="/notifications.png" alt="Quiz" className="w-20 h-20 lg:w-24 lg:h-24" /></div>
      </div>

      {/* Filters */}
      <div className="max-w-4xl mt-40 mx-auto px-4 py-4">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => filterNotifications('all')}
            className={`px-4 py-2 rounded-full ${
              selectedFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => filterNotifications('unread')}
            className={`px-4 py-2 rounded-full ${
              selectedFilter === 'unread'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => filterNotifications('read')}
            className={`px-4 py-2 rounded-full ${
              selectedFilter === 'read'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Read
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {getFilteredNotifications().map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow p-4 transition duration-200 ${
                !notification.read ? 'border-l-4 border-blue-500' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {!notification.read ? (
                    <Circle className="h-2 w-2 mt-2 text-blue-600 fill-current" />
                  ) : (
                    <div className="h-2 w-2 mt-2" />
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">
                        {notification.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeStyles(notification.type)}`}>
                        {notification.type}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">{notification.message}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>{notification.course}</span>
                      <span>•</span>
                      <span>{format(notification.timestamp, 'MMM d, h:mm a')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <button
                    onClick={() => setShowActions(notification.id === showActions ? null : notification.id)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <MoreVertical className="h-5 w-5 text-gray-500" />
                  </button>
                  
                  {showActions === notification.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                        >
                          <Check className="h-4 w-4 mr-3" />
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full"
                      >
                        <Trash2 className="h-4 w-4 mr-3" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {getFilteredNotifications().length === 0 && (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No notifications</h3>
              <p className="mt-2 text-gray-500">We'll notify you when something arrives.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notification;