import { useState } from "react"

import "./style.css"

function IndexOptions() {
  const [data, setData] = useState("")

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Welcome to your{" "}
          <a
            href="https://www.plasmo.com"
            className="hover:text-blue-400 transition-colors">
            Plasmo
          </a>{" "}
          Extension!
        </h1>

        <div className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Demo Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Sample Input
                </label>
                <input
                  type="text"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Type something..."
                />
              </div>

              <div className="bg-gray-900/50 p-4 rounded-md">
                <p className="text-sm text-gray-400">
                  Preview: {data || "Nothing typed yet"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-8 text-center text-gray-400 text-sm">
          Crafted with passion, and Seismic - by Doug Silkstone -
          withSeismic.com
        </footer>
      </div>
    </div>
  )
}

export default IndexOptions
