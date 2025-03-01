import React, { useState } from 'react';
import { useRouter } from 'next/router';

function Login() {
  const [caserne_id, setCaserneId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission

    try {
      // Send a POST request to the login endpoint
      const response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ caserne_id, password }),
      });

      if (!response.ok) {
        const errorData = await response.json(); // Parse the error response
        setError(errorData.message || 'Login failed'); // Set the error message
        return; // Exit the function to prevent further execution
      }
      // Parse the response JSON
      const data = await response.json();

      // Store the token in local storage
      localStorage.setItem('token', data.token);

      // Redirect to the scan-qr-code page
      router.replace('/scan-qr-code').then(() => window.location.reload());
      } catch (err) {
      setError('Invalid email or password');
      console.error('Login error:', err);
    }
  };

  return (
    <>
      <div className="min-h-screen flex justify-center items-center bg-cover bg-center bg-no-repeat bg-[#1a1a2e] px-4">
        {/* Login Container */}
        <div className="relative w-full max-w-6xl p-4 sm:p-8 flex justify-center items-center">
          {/* Login Wrapper */}
          <div className="relative bg-[#22243d] rounded-lg p-6 sm:p-8 w-full max-w-sm shadow-lg text-center z-10">
            <h2 className="text-4xl sm:text-5xl font-semibold mb-6 sm:mb-8 text-white">Login</h2>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-2 bg-red-600 text-white rounded-lg">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form className="flex flex-col items-center w-full" onSubmit={handleSubmit}>
              {/* Email Input */}
              <div className="w-full mb-4">
                <input
                  type="text"
                  id="id"
                  placeholder="Enter ID"
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f5c76b]"
                  required
                  value = {caserne_id}
                  onChange={(e) => setCaserneId(e.target.value)}
                />
              </div>

              {/* Password Input */}
              <div className="w-full mb-6">
                <input
                  type="password"
                  id="password"
                  placeholder="Password"
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f5c76b]"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                className="w-full px-4 py-3 rounded-lg bg-[#2A6140] text-white font-semibold hover:bg-[#1e4a2d] transition-all"
              >
                Log In
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;