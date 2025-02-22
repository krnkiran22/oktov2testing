"use client";
import { getOrdersHistory, useOkto } from "@okto_web3/react-sdk";
import { useState, useEffect } from "react";

const CheckJobStatus = () => {
  const [jobId, setJobId] = useState<string>("");
  const [status, setStatus] = useState<string | null>(null);
  const [transactionHashes, setTransactionHashes] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const oktoClient = useOkto();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJobId(e.target.value);
  };

  const fetchJobStatus = async () => {
    try {
      const response = await getOrdersHistory(oktoClient, {
        intentId: jobId,
        intentType: "NFT_TRANSFER",
      });

      if (response.length > 0) {
        const job = response[0]; // Fetch the latest job status
        setStatus(job.status || "Unknown");

        if (Array.isArray(job.transactionHash) && job.transactionHash.length > 0) {
          setTransactionHashes(job.transactionHash);
        }

        // Stop polling if the job has reached a final state
        if (["SUCCESSFUL", "FAILED", "CANCELLED"].includes(job.status)) {
          setIsPolling(false);
        }
      } else {
        setStatus("No job found with this ID.");
      }
    } catch (error) {
      setStatus("Failed to fetch status.");
      setIsPolling(false);
    }
  };

  const checkJobStatus = () => {
    if (!jobId) {
      alert("Please enter a JobId.");
      return;
    }

    setLoading(true);
    setStatus(null);
    setTransactionHashes([]);
    setIsPolling(true);
  };

  // Auto-refresh every 5 seconds if polling is active
  useEffect(() => {
    if (isPolling) {
      fetchJobStatus(); // Fetch immediately
      const interval = setInterval(fetchJobStatus, 5000); // Poll every 5 seconds
      return () => clearInterval(interval); // Cleanup on unmount or stop polling
    }
  }, [isPolling]);

  return (
    <div className="mt-6 p-4 border rounded bg-white shadow">
      <h3 className="text-lg font-bold mb-2">Check Job Status</h3>
      <div className="flex items-center space-x-4">
        <input
          type="text"
          placeholder="Enter JobId"
          value={jobId}
          onChange={handleInputChange}
          className="border p-2 rounded w-full"
        />
        <button
          onClick={checkJobStatus}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          {isPolling ? "Checking..." : "Check Status"}
        </button>
      </div>

      {status && (
        <div className="mt-4">
          <h4 className="font-semibold">Job Status:</h4>
          <p className={`font-bold ${status === "SUCCESSFUL" ? "text-green-600" : "text-red-600"}`}>
            {status}
          </p>
        </div>
      )}

      {transactionHashes.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold">Transaction Hashes:</h4>
          <ul className="list-disc list-inside">
            {transactionHashes.map((hash, index) => (
              <li key={index} className="text-sm text-gray-700 break-all">
                {hash}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CheckJobStatus;
