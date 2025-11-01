import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";

interface Model {
  name: string;
  fields: any[];
  existsInDatabase?: boolean;
}

const HomePage: React.FC = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();
  const navigate = useNavigate();
 const location = useLocation();
 const fetchModels = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/models/get-models", {
       
      });
      setModels(res.data.models || []);
    } catch (error) {
      console.error("Error fetching models:", error);
    } finally {
      setLoading(false);
    }
  };

 
  useEffect(() => {
    fetchModels();
  }, []);

  
  useEffect(() => {
    if (location.state?.refresh) {
      fetchModels();
      navigate(location.pathname, { replace: true, state: {} }); 
    }
  }, [location, navigate, token]);

  const handleAddModel = () => {
    if (user?.role !== "admin") {
      alert("🚫 You are not allowed to create new models!");
      return;
    }
    navigate("/create");
  };

  const handleDeleteModel = async (modelName: string) => {
    if (user?.role !== "admin") {
      alert("🚫 You are not authorized to delete models!");
      return;
    }
    if (!window.confirm(`Are you sure you want to delete model "${modelName}"?`))
      return;

    try {
      const res = await axios.delete(
        `http://localhost:5000/api/models/delete-model/${modelName}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 200) {
        alert(`✅ Model "${modelName}" deleted successfully.`);
        setModels((prev) => prev.filter((m) => m.name !== modelName));
        // eslint-disable-next-line no-restricted-globals
        if (location.pathname !== "/") navigate("/", { replace: true });
      }
    } catch (error: any) {
      console.error("Error deleting model:", error);
      alert(`⚠️ Error: ${error.response?.data?.message || "Something went wrong."}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-gray-400 bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900">
        Loading models...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-gray-100 flex flex-col items-center py-20 px-4">
  
      <div className="w-full max-w-5xl flex justify-between items-center mb-10">
        <h2 className="text-3xl font-bold text-center text-teal-400 mb-8 drop-shadow-[0_0_5px_rgba(45,212,191,0.6)]">
          Available Models
        </h2>

        <button
          onClick={handleAddModel}
          className="mt-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 shadow-[0_0_15px_rgba(45,212,191,0.4)] hover:shadow-[0_0_25px_rgba(45,212,191,0.6)] transition-all"
        >
          ➕ Add New Model
        </button>
      </div>

      {models.length === 0 ? (
        <p className="text-gray-300 text-lg">No models found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-center max-w-5xl">
          {models.map((model) => (
            <Link
              key={model.name}
              to={`/model/${model.name}`}
              className="group relative bg-slate-800/60 hover:bg-slate-700/80 backdrop-blur-md border border-slate-700 hover:border-cyan-400 rounded-2xl shadow-lg transition-all duration-300 p-5 flex flex-col justify-between w-[280px] mx-auto"
            >
           
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-cyan-300 group-hover:text-cyan-400 transition">
                  {model.name}
                </h3>

                
                {user?.role === "admin" && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteModel(model.name);
                    }}
                    className="bg-red-600/80 hover:bg-red-700 text-white p-2 rounded-md text-sm transition-all duration-300"
                  >
                    🗑️
                  </button>
                )}
              </div>

              <div className="text-gray-300 text-sm space-y-1">
                <p>{model.fields?.length || 0} fields</p>
                <p
                  className={`font-medium ${
                    model.existsInDatabase ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {model.existsInDatabase ? "Synced with Database" : "Not in Database"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
