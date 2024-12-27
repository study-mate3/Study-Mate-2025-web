// src/pages/RoleSelection.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleRoleSelection = (role) => {
    navigate(`/signup/${role}`);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Select Your Role</h2>
        <div className="space-y-4">
          <button
            onClick={() => handleRoleSelection("student")}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Student
          </button>
          <button
            onClick={() => handleRoleSelection("parent")}
            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
          >
            Parent
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
