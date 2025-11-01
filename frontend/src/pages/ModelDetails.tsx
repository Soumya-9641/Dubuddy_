import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Field {
  name: string;
  type: string;
  required?: boolean;
  default?: any;
  defaultValue?: any;
}

interface ModelResponse {
  message: string;
  model: {
    name: string;
    fields: Field[];
    existsInDatabase: boolean;
    sampleRecords: any[];
  };
}

const ModelDetails: React.FC = () => {
  const navigate = useNavigate();
  const { name } = useParams();
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const { token, user } = useAuth();

  useEffect(() => {
    if (user === null) {
      navigate("/login");
      return;
    }

    const fetchModel = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/models/get-model/${name}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data: ModelResponse = await res.json();
        if (res.ok && data.model) {
          const formattedFields = data.model.fields.map((f) => ({
            ...f,
            defaultValue: f.defaultValue ?? "",
          }));
          setFields(formattedFields);
        } else {
          console.error("Failed to fetch model:", data.message);
        }
      } catch (error) {
        console.error("Error fetching model:", error);
      } finally {
        setLoading(false);
      }
    };

    if (name) fetchModel();
  }, [name, token]);

  const handleDelete = (index: number) => {
    if (user?.role !== "admin") {
      alert("🚫 Only admin can delete fields!");
      return;
    }
    const updated = [...fields];
    updated.splice(index, 1);
    setFields(updated);
  };

  const handleEdit = (field: Field, index: number) => {
    if (user?.role !== "admin") {
      alert("🚫 Only admin can edit fields!");
      return;
    }
    setEditingField({ ...field, index });
    setIsAddMode(false);
    setIsModalOpen(true);
  };

  const handleAddField = () => {
    if (user?.role !== "admin") {
      alert("🚫 Only admin can add fields!");
      return;
    }
    setEditingField({
      name: "",
      type: "string",
      required: false,
      defaultValue: "",
      index: fields.length,
    });
    setIsAddMode(true);
    setIsModalOpen(true);
  };

  const handleSaveField = () => {
    const updated = [...fields];
    if (isAddMode) {
      updated.push({
        name: editingField.name,
        type: editingField.type,
        required: editingField.required,
        defaultValue: editingField.defaultValue,
      });
    } else {
      updated[editingField.index] = {
        name: editingField.name,
        type: editingField.type,
        required: editingField.required,
        defaultValue: editingField.defaultValue,
      };
    }
    setFields(updated);
    setIsModalOpen(false);
    setEditingField(null);
    setIsAddMode(false);
  };

  const handlePublish = async () => {
    if (user?.role !== "admin") {
      alert("🚫 Only admin can publish changes!");
      return;
    }
    if (!name) return;

    try {
      const payload = { name, fields };
      const res = await fetch(`http://localhost:5000/api/models/update-model/${name}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`✅ Model "${name}" updated successfully!`);
        setTimeout(() => {
      navigate("/", { state: { refresh: true } });
    }, 2000);
      } else {
        alert(`❌ Failed to update model: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error publishing model:", error);
      alert("⚠️ Something went wrong while updating the model.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-300 bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900">
        Loading model details...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-gray-100 flex flex-col items-center py-20 px-4">
     
      <div className="w-full max-w-5xl flex justify-between items-center mb-10">
        <h2 className="text-3xl font-bold text-center text-teal-400 mb-8 drop-shadow-[0_0_5px_rgba(45,212,191,0.6)]">
          Model: {name}
        </h2>
        <div className="flex gap-3">
          <button
            onClick={handleAddField}
            className="mt-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 shadow-[0_0_15px_rgba(45,212,191,0.4)] hover:shadow-[0_0_25px_rgba(45,212,191,0.6)] transition-all"
          >
            ➕ Add Field
          </button>
          <button
            onClick={handlePublish}
            className="mt-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white px-5 py-2 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] hover:from-green-500 hover:to-emerald-400 transition-all duration-300"
          >
            📤 Publish Changes
          </button>
        </div>
      </div>


      {fields.length === 0 ? (
        <p className="text-gray-400 text-lg">No fields defined.</p>
      ) : (
        <div className="w-full max-w-5xl overflow-x-auto bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-2xl shadow-xl">
          <table className="w-full text-sm text-gray-200">
            <thead className="bg-slate-700/80 text-cyan-300">
              <tr>
                <th className="p-3 text-left">Field Name</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-center">Required</th>
                <th className="p-3 text-left">Default Value</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <tr
                  key={index}
                  className="hover:bg-slate-700/60 transition-all duration-300"
                >
                  <td className="p-3">{field.name}</td>
                  <td className="p-3 capitalize">{field.type}</td>
                  <td className="p-3 text-center">
                    {field.required ? "✅" : "❌"}
                  </td>
                  <td className="p-3">
                    {field.defaultValue !== undefined
                      ? String(field.defaultValue)
                      : ""}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      className="bg-blue-500/80 hover:bg-blue-600 text-white px-3 py-1 rounded-md mr-2 transition-all"
                      onClick={() => handleEdit(field, index)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="bg-red-500/80 hover:bg-red-600 text-white px-3 py-1 rounded-md transition-all"
                      onClick={() => handleDelete(index)}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      
      {isModalOpen && editingField && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl w-96 text-white relative">
            <h3 className="text-xl font-bold mb-4 text-cyan-300">
              {isAddMode ? "Add New Field" : "Edit Field"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-gray-300">Field Name</label>
                <input
                  type="text"
                  className="bg-slate-700 border border-slate-600 p-2 w-full rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  value={editingField.name}
                  onChange={(e) =>
                    setEditingField({ ...editingField, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-300">Type</label>
                <select
                  className="bg-slate-700 border border-slate-600 p-2 w-full rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  value={editingField.type}
                  onChange={(e) =>
                    setEditingField({ ...editingField, type: e.target.value })
                  }
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingField.required}
                  onChange={(e) =>
                    setEditingField({
                      ...editingField,
                      required: e.target.checked,
                    })
                  }
                />
                <span>Required</span>
              </div>

              <div>
                <label className="block mb-1 text-gray-300">Default Value</label>
                <input
                  type="text"
                  className="bg-slate-700 border border-slate-600 p-2 w-full rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  value={editingField.defaultValue}
                  onChange={(e) =>
                    setEditingField({
                      ...editingField,
                      defaultValue: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="bg-slate-600 hover:bg-slate-500 text-white px-3 py-1 rounded-md"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-3 py-1 rounded-md transition-all"
                onClick={handleSaveField}
              >
                {isAddMode ? "Add" : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelDetails;
