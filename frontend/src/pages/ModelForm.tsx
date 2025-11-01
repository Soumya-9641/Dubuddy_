import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Role = "Admin" | "Manager" | "Viewer";
type Permission = "create" | "read" | "update" | "delete" | "all";

interface Field {
  name: string;
  type: string;
  required: boolean;
  defaultValue: string;
}

interface Rbac {
  Admin: Permission[];
  Manager: Permission[];
  Viewer: Permission[];
}

const ModelForm: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [modelName, setModelName] = useState("");
  const [fields, setFields] = useState<Field[]>([
    { name: "", type: "string", required: false, defaultValue: "" },
  ]);

  const [rbac, setRbac] = useState<Rbac>({
    Admin: ["all"],
    Manager: [],
    Viewer: [],
  });

  const allPermissions: Permission[] = ["create", "read", "update", "delete", "all"];

  const addField = () => {
    setFields([...fields, { name: "", type: "string", required: false, defaultValue: "" }]);
  };

  const handleChange = <K extends keyof Field>(index: number, key: K, value: Field[K]) => {
    const updatedFields = [...fields];
    updatedFields[index] = { ...updatedFields[index], [key]: value } as Field;
    setFields(updatedFields);
  };

  const handleRbacChange = (role: Role, permission: Permission) => {
    const updated = { ...rbac };

    if (permission === "all") {
      updated[role] = updated[role].includes("all") ? [] : ["all"];
    } else {
      if (updated[role].includes("all")) updated[role] = [];
      if (updated[role].includes(permission)) {
        updated[role] = updated[role].filter((p) => p !== permission);
      } else {
        updated[role].push(permission);
      }
    }

    setRbac(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const modelData = { name: modelName, fields, rbac };
    try {
      const res = await fetch("http://localhost:5000/api/models/create-model", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(modelData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to create model");
      }

      const data = await res.json();
      alert(`✅ Model "${modelName}" created successfully! Redirecting...`);
      
    setTimeout(() => {
      navigate("/", { state: { refresh: true } });
    }, 2000);
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-gray-100 flex flex-col items-center py-20 px-4">
      <div className="bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-[0_0_35px_rgba(20,184,166,0.3)] p-8 w-full max-w-4xl border border-slate-700">
        <h2 className="text-3xl font-bold text-center text-teal-400 mb-8 drop-shadow-[0_0_5px_rgba(45,212,191,0.6)]">
          🧩 Create New Model
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
        
          <div>
            <label className="font-semibold block mb-2 text-gray-300">Model Name:</label>
            <input
              type="text"
              className="border border-slate-600 bg-slate-900 text-white focus:ring-2 focus:ring-teal-400 p-3 rounded-lg w-full transition-all outline-none"
              placeholder="Enter model name"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              required
            />
          </div>

         
          <div>
            <h3 className="font-semibold text-lg mb-3 text-teal-300">
              🔐 Role-Based Access Control
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-slate-700 rounded-lg overflow-hidden">
                <thead className="bg-teal-600 text-white">
                  <tr>
                    <th className="p-3 text-left">Role</th>
                    {allPermissions.map((perm) => (
                      <th key={perm} className="p-3 capitalize">
                        {perm}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-slate-900/60">
                  {(Object.keys(rbac) as Role[]).map((role) => (
                    <tr key={role} className="text-center border-t border-slate-700 hover:bg-slate-800/80 transition-all">
                      <td className="p-3 font-medium text-gray-200 text-left">{role}</td>
                      {allPermissions.map((perm) => (
                        <td key={perm} className="p-3">
                          <input
                            type="checkbox"
                            checked={rbac[role].includes(perm)}
                            onChange={() => handleRbacChange(role, perm)}
                            className="accent-teal-500 cursor-pointer"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3 text-teal-300">📦 Fields</h3>
            {fields.map((field, index) => (
              <div
                key={index}
                className="flex flex-wrap gap-3 items-center border border-slate-700 bg-slate-900/60 rounded-lg p-3 shadow-sm mb-2"
              >
                <input
                  type="text"
                  placeholder="Field name"
                  value={field.name}
                  onChange={(e) => handleChange(index, "name", e.target.value)}
                  className="border border-slate-600 bg-slate-800 text-white p-2 rounded-lg w-1/4 focus:ring-2 focus:ring-teal-400 outline-none"
                  required
                />
                <select
                  value={field.type}
                  onChange={(e) => handleChange(index, "type", e.target.value)}
                  className="border border-slate-600 bg-slate-800 text-white p-2 rounded-lg w-1/4 focus:ring-2 focus:ring-teal-400 outline-none"
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                </select>
                <label className="flex items-center gap-2 text-gray-400">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => handleChange(index, "required", e.target.checked)}
                    className="accent-teal-500"
                  />
                  Required
                </label>
                <input
                  type="text"
                  placeholder="Default value"
                  value={field.defaultValue}
                  onChange={(e) => handleChange(index, "defaultValue", e.target.value)}
                  className="border border-slate-600 bg-slate-800 text-white p-2 rounded-lg w-1/4 focus:ring-2 focus:ring-teal-400 outline-none"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addField}
              className="mt-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 shadow-[0_0_15px_rgba(45,212,191,0.4)] hover:shadow-[0_0_25px_rgba(45,212,191,0.6)] transition-all"
            >
              ➕ Add Field
            </button>
          </div>

       
          <div className="text-center">
            <button
              type="submit"
              className="bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow-[0_0_15px_rgba(56,189,248,0.5)] hover:shadow-[0_0_25px_rgba(56,189,248,0.8)] transition-all"
            >
              🚀 Publish Model
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModelForm;
