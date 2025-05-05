import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

const IssuesList = () => {
  const [issues, setIssues] = useState([]);

  // Fetch issues from Firestore
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "issues"));
        const issuesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setIssues(issuesData);
      } catch (error) {
        console.error("Error fetching issues:", error);
      }
    };

    fetchIssues();
  }, []);

  // Function to update "Solved" status and remarks in the Firestore
  const handleUpdateIssue = async (issueId, solved, remarks) => {
    try {
      // Ensure solved and remarks have valid values
      const updatedSolved = solved !== undefined ? solved : false;
      const updatedRemarks = remarks !== undefined ? remarks : "";

      const issueRef = doc(db, "issues", issueId);
      await updateDoc(issueRef, {
        solved: updatedSolved,
        remarks: updatedRemarks,
      });

      // Optionally, update the local state for the issue in the UI
      setIssues(prevIssues =>
        prevIssues.map((issue) =>
          issue.id === issueId ? { ...issue, solved: updatedSolved, remarks: updatedRemarks } : issue
        )
      );
    } catch (error) {
      console.error("Error updating issue:", error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 mt-6 text-center">Reported Issues</h1>

      {issues.length === 0 ? (
        <p>No issues reported yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-blue-600 shadow-md rounded-lg">
            <thead>
              <tr className="bg-blue-200 text-left">
                <th className="p-2 border">User ID</th>
                <th className="p-2 border">Category</th>
                <th className="p-2 border">Details</th>
                <th className="p-2 border">Timestamp</th>
                <th className="p-2 border">Solved</th> {/* New column for Solved */}
                <th className="p-2 border">Remarks</th> {/* New column for Remarks */}
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <tr key={issue.id} className="border-t hover:bg-gray-50">
                  <td className="p-2 border">{issue.userId || "N/A"}</td>
                  <td className="p-2 border">{issue.category || "N/A"}</td>
                  <td className="p-2 border">
                    {typeof issue.details === "object"
                      ? Object.entries(issue.details).map(([key, value]) => (
                          <p key={key}>
                            <strong>{key}:</strong> {value}
                          </p>
                        ))
                      : issue.details || "N/A"}
                  </td>
                  <td className="p-2 border">
                    {issue.timestamp
                      ? new Date(issue.timestamp.seconds * 1000).toLocaleString()
                      : "N/A"}
                  </td>
                  <td className="p-2 border">
                    {/* Checkbox to mark as solved */}
                    <input
                      type="checkbox"
                      checked={issue.solved || false}
                      onChange={(e) =>
                        handleUpdateIssue(issue.id, e.target.checked, issue.remarks)
                      }
                    />
                  </td>
                  <td className="p-2 border">
                    {/* Remarks input */}
                    <input
                      type="text"
                      value={issue.remarks || ""}
                      onChange={(e) =>
                        handleUpdateIssue(issue.id, issue.solved, e.target.value)
                      }
                      placeholder="Add remarks"
                      className="border p-2 w-full"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default IssuesList;
