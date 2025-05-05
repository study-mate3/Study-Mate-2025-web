import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

export default function PaypalButtons({ userId }) {
  const [{ isPending, isResolved, isRejected }] = usePayPalScriptReducer();
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading PayPal buttons...");

  useEffect(() => {
    // Set loading state for PayPal button
    if (isPending) {
      setLoadingMessage("Loading PayPal buttons...");
    } else if (isRejected) {
      setLoadingMessage("Failed to load PayPal buttons. Please try again.");
    } else if (isResolved) {
      setLoadingMessage("");
    }
  }, [isPending, isRejected, isResolved]);

  // Function to update Firestore after successful payment
  const updatePaymentStatus = async () => {
    try {
      const userRef = doc(db, "users", userId); // Assuming userId is passed as prop
      await updateDoc(userRef, { paid: "yes" }); // Set paid field to 'yes'
      console.log("Payment status updated successfully.");
      setPaymentSuccess(true); // Assuming you have a state to manage payment success
      navigate('/quiz'); // Navigate to /quiz after successful payment update
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center bg-white p-6 rounded-lg shadow-md w-full max-w-md">
      {loadingMessage && (
        <div className="text-gray-600 text-sm mb-4 animate-pulse">{loadingMessage}</div>
      )}

      {!paymentSuccess && isResolved && !isPending && (
        <PayPalButtons
          style={{ layout: "vertical" }}
          createOrder={(data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: "2.50", // Always $2.50
                  },
                },
              ],
            });
          }}
          onApprove={(data, actions) => {
            return actions.order.capture().then((details) => {
              alert(`Transaction completed by ${details.payer.name.given_name}!`);
              setPaymentSuccess(true);
              updatePaymentStatus(); // Update Firestore after successful payment
            });
          }}
          onError={(err) => {
            console.error("PayPal Error:", err);
            alert("An error occurred. Please try again.");
          }}
        />
      )}

      {paymentSuccess && (
        <div className="text-green-600 font-semibold text-lg mt-4">
          ✅ Payment Successful
        </div>
      )}

      {isRejected && (
        <div className="text-red-500 mt-4 text-center">
          <p>Failed to load PayPal buttons.</p>
          <button
            className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            onClick={() => dispatch({ type: "setLoadingStatus", value: "pending" })}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
