import React, { useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {User} from "@heroui/user";
import {Divider} from "@heroui/react";
import {Card, CardHeader, Image} from "@heroui/react";



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

      

      {/* Display Backend Data */}
      {backendData && (
        <div className="mt-6 p-4 bg-gray-800 rounded-lg w-full max-w-2xl">


          {/* Chauffeur Details */}
          <h3 className="text-lg font-semibold mb-2">Détails du chauffeur</h3>
          {backendData.chauffeur && (
            <div>
              <User
                avatarProps={{
                  src: backendData.chauffeur.photo_url,
                }}
                description={backendData.chauffeur.numero_permis}
                name={`${backendData.chauffeur.nom} ${backendData.chauffeur.prenom}`} 
              />
            </div>
          )}


          <Divider className="my-4 bg-white" />


          <h3 className="text-lg font-semibold mb-2">Détail du camion</h3>
          <Card className="max-w-[400px]">
            <CardHeader className="flex gap-3 bg-gray-700">
              <Image
                alt="heroui logo"
                height={40}
                radius="sm"
                // src="https://images.emojiterra.com/google/android-12l/512px/1f69a.png"
                width={40}
              />
              <div className="flex flex-col">
                <p className="text-md text-white">Numéro Carte Grise: {backendData.camion.num_carte_grise}</p>
                <p className="text-small text-white">{backendData.camion.num_ctrl_tech}  - {new Date(backendData.camion.date_ctrl_tech).toLocaleDateString()} </p>
              </div>
            </CardHeader>
          </Card>


          <Divider className="my-4 bg-white" />


          {/* Trajet Details */}
          {backendData.trajet && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Détails du trajet </h3>
              <div className="bg-gray-800 p-4 rounded-lg">
                
                {/* Départ */}
                <div className="flex items-center justify-between bg-gray-700 p-3 rounded-lg mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 flex items-center justify-center rounded-full border border-blue-400">
                      <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    </div>
                    <p className="text-white">{backendData.trajet.depart}</p>
                  </div>
                  <p className="text-gray-300 text-sm">
                    {new Date(backendData.trajet.date_heure_depart).toLocaleString()}
                  </p>
                </div>

                {/* Destination */}
                <div className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 flex items-center justify-center rounded-full text-white">
                      📍
                    </div>
                    <p className="text-white">{backendData.trajet.destination}</p>
                  </div>
                  <p className="text-gray-300 text-sm">
                    {new Date(backendData.trajet.date_heure_arrivee_prevue).toLocaleString()}
                  </p>
                </div>

              </div>
            </div>
          )}


          <Divider className="my-4 bg-white" />



          {/* Pieces Details */}
          {backendData.pieces && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Pieces Details</h3>

            {/* Grid Layout for Multiple Pieces */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {backendData.pieces.map((piece, index) => (
                <div key={index} className="bg-gray-700 p-4 rounded-lg shadow-lg">
                  <h4 className="text-lg font-semibold text-white mb-2">{piece.nom}</h4>
                  <p className="text-gray-300">🔹 <strong>Description:</strong> {piece.description}</p>
                  <p className="text-gray-300">🔹 <strong>Référence:</strong> {piece.num_ref}</p>
                  <p className="text-gray-300">🔹 <strong>Catégorie:</strong> {piece.categorie} - {piece.sous_categorie}</p>
                  <p className="text-gray-300">🔹 <strong>Matériau:</strong> {piece.materiau}</p>
                  <p className="text-gray-300">🔹 <strong>Dimensions:</strong> {piece.dimension}</p>
                  <p className="text-gray-300">🔹 <strong>Couleur:</strong> {piece.couleur}</p>
                  <p className="text-white font-semibold mt-2">🛠️ Quantité: {piece.quantity}</p>

                  {/* Image */}
                  <img
                    src={piece.photo_url}
                    alt={`Photo of ${piece.nom}`}
                    className="w-full h-40 object-cover rounded-lg mt-3"
                  />
                </div>
              ))}
            </div>
          </div>
        )}



          
        </div>
      )}
    </div>
  );
};

export default ScanPage;