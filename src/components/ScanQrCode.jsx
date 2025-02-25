import React, { useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const ScanPage = () => {
  const [qrData, setQrData] = useState(null); // State to store the scanned QR code data
  const [backendData, setBackendData] = useState(null); // State to store the backend response
  const [isScanning, setIsScanning] = useState(false); // State to track if scanning is active
  const [error, setError] = useState(''); // State to store error messages
  const scannerRef = useRef(null); // Ref to store the Html5Qrcode instance

  // Function to start the camera and QR code scanner
  const startScanner = () => {
    const html5Qrcode = new Html5Qrcode("reader");
    scannerRef.current = html5Qrcode;

    html5Qrcode.start(
      { facingMode: "environment" }, // Use the rear camera
      { fps: 10, qrbox: 250 }, // Scanner configuration
      async (decodedText) => {
        setQrData(decodedText); // Set the scanned data
        stopScanner(); // Stop the scanner after successful scan
        await fetchBackendData(decodedText); // Send the scanned data to the backend
      },
      (errorMessage) => {
        console.warn(errorMessage); // Log any errors
      }
    ).then(() => {
      setIsScanning(true); // Set scanning state to true
    }).catch((err) => {
      console.error("Error starting scanner:", err);
      setError("Failed to start the scanner. Please check your camera permissions.");
    });
  };

  // Function to stop the camera and QR code scanner
  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => {
        console.log("Scanner stopped successfully");
        setIsScanning(false); // Set scanning state to false
      }).catch((err) => {
        console.warn("Error stopping scanner:", err);
      });
    }
  };

  // Function to send the scanned data to the backend and retrieve additional data
  const fetchBackendData = async (code) => {
    try {
      const token = localStorage.getItem('token'); // Retrieve the token from local storage
      if (!token) {
        setError("No token found. Please log in again.");
        return;
      }

      const response = await fetch("http://localhost:8080/api/app/scanQrCode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Include the token in the request
        },
        body: JSON.stringify({ qrcode: code }), // Send the scanned QR code data
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${errorText}`);
      }

      const data = await response.json(); // Parse the backend response
      setBackendData(data); // Store the backend response in state
    } catch (err) {
      console.error("Error fetching backend data:", err);
      setError(err.message || "An error occurred while fetching data.");
    }
  };

  // Start the scanner when the page loads
  React.useEffect(() => {
    startScanner();

    // Cleanup function to stop the scanner when the component unmounts
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-6">QR Code Scanner</h1>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-2 bg-red-600 text-white rounded-lg">
          {error}
        </div>
      )}

      {/* QR Code Scanner Container */}
      <div id="reader" className="w-full max-w-sm mb-6"></div>

      {/* Button to Trigger Scanning */}
      {!qrData && (
        <button
          onClick={startScanner}
          disabled={isScanning}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
        >
          {isScanning ? "Scanning..." : "Scan QR Code"}
        </button>
      )}

      {/* Display Scanned Data */}
      {qrData && (
        <div className="mt-6 p-4 bg-gray-800 rounded-lg w-full max-w-sm">
          <h2 className="text-xl font-semibold mb-4">Scanned Data</h2>
          <pre className="whitespace-pre-wrap break-words">{qrData}</pre>
        </div>
      )}

      {/* Display Backend Data */}
      {backendData && (
        <div className="mt-6 p-4 bg-gray-800 rounded-lg w-full max-w-2xl">
          <h2 className="text-xl font-semibold mb-4">Backend Data</h2>

          {/* Camion Details */}
          {backendData.camion && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Camion Details</h3>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p><strong>Numéro Carte Grise:</strong> {backendData.camion.num_carte_grise}</p>
                <p><strong>Numéro Contrôle Technique:</strong> {backendData.camion.num_ctrl_tech}</p>
                <p><strong>Date Contrôle Technique:</strong> {new Date(backendData.camion.date_ctrl_tech).toLocaleDateString()}</p>
              </div>
            </div>
          )}

          {/* Trajet Details */}
          {backendData.trajet && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Trajet Details</h3>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p><strong>Départ:</strong> {backendData.trajet.depart}</p>
                <p><strong>Destination:</strong> {backendData.trajet.destination}</p>
                <p><strong>Date et Heure de Départ:</strong> {new Date(backendData.trajet.date_heure_depart).toLocaleString()}</p>
                <p><strong>Date et Heure d'Arrivée Prévue:</strong> {new Date(backendData.trajet.date_heure_arrivee_prevue).toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* Pieces Details */}
          {backendData.pieces && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Pieces Details</h3>
              <div className="bg-gray-700 p-4 rounded-lg">
                {backendData.pieces.map((piece, index) => (
                  <div key={index} className="mb-4">
                    <p><strong>Nom:</strong> {piece.nom}</p>
                    <p><strong>Référence:</strong> {piece.num_ref}</p>
                    <p><strong>Description:</strong> {piece.description}</p>
                    <p><strong>Catégorie:</strong> {piece.categorie}</p>
                    <p><strong>Sous-Catégorie:</strong> {piece.sous_categorie}</p>
                    <p><strong>Matériau:</strong> {piece.materiau}</p>
                    <p><strong>Dimensions:</strong> {piece.dimension}</p>
                    <p><strong>Couleur:</strong> {piece.couleur}</p>
                    <p><strong>Photo URL:</strong> <a href={piece.photo_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{piece.photo_url}</a></p>
                    <p><strong>Quantité:</strong> {piece.quantity}</p>
                    {index < backendData.pieces.length - 1 && <hr className="my-2 border-gray-600" />} {/* Separator between pieces */}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chauffeur Details */}
          {backendData.chauffeur && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Chauffeur Details</h3>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p><strong>Nom:</strong> {backendData.chauffeur.nom}</p>
                <p><strong>Prénom:</strong> {backendData.chauffeur.prenom}</p>
                <p><strong>Numéro de Permis:</strong> {backendData.chauffeur.numero_permis}</p>
                <p><strong>Photo URL:</strong> <a href={backendData.chauffeur.photo_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{backendData.chauffeur.photo_url}</a></p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScanPage;