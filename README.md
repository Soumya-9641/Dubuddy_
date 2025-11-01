# 🧠 DUBUDDY — Dynamic Model Management Platform

**DUBUDDY** is a low-code dynamic model management platform that lets you create database models and instantly generate API endpoints — all from a simple UI.  
It includes **role-based access control (RBAC)**, automatic **Sequelize model creation**, and **live MySQL synchronization**.

---

## ⚙️ Tech Stack

### 🖥️ Frontend
- ⚛️ **React + Vite + TypeScript**
- 🎨 **TailwindCSS** for UI styling
- 🌐 **Axios** for API communication
- 🔐 **Context API** for Authentication

### 🧩 Backend
- 🟢 **Node.js + Express**
- 🛢️ **MySQL (via Sequelize ORM)**
- 🔑 **JWT Authentication**
- 👥 **Role-Based Access Control** (Admin / Manager / Viewer)
- 🧠 **Dynamic Model Creation** with JSON files

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Soumya-9641/Dubuddy_
cd DUBUDDY
2️⃣ Setup Backend
cd backend
npm install
✏️ Configure Environment
Create a .env file inside /backend with the following:

env
Copy code
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=dubuddy
JWT_SECRET=your_jwt_secret
🛢️ Start MySQL
Make sure MySQL (XAMPP or standalone) is running.

Then manually create a database:

sql
CREATE DATABASE dubuddy;
▶️ Start Backend Server
npm run dev
Your backend will run at:
👉 http://localhost:5000

3️⃣ Setup Frontend
bash
Copy code
cd frontend
npm install
npm run dev
Your frontend will run at:
👉 http://localhost:3000

🔐 Default Login Credentials
Role	Email / Username	Password
Admin	soumyadip@gmail.com	123456
Manager	manager@gmail.com	123456
Viewer	user@gmail.com	1234

💡 Admin can create, update, and delete models.

🧩 How to Publish a New Model
1️⃣ Login as Admin
2️⃣ Go to Home Page → ➕ Add New Model
3️⃣ Define:

Model Name: e.g. Employee

Fields: e.g. empId, name, salary

RBAC Permissions for each role
4️⃣ Click Publish

✅ On Publish:
A new JSON file is created inside:

backend/dynamicModels/
Example:

json
Copy code
{
  "name": "Employee",
  "fields": [
    { "name": "empId", "type": "integer", "required": true },
    { "name": "name", "type": "string", "required": true },
    { "name": "salary", "type": "integer" }
  ],
  "rbac": {
    "Admin": ["all"],
    "Manager": ["update", "read"],
    "Viewer": ["read"]
  }
}
⚙️ How JSON Files Work
Each published model is stored as:

backend/dynamicModels/<modelName>.json
These files define:

🧱 Model name

🔡 Field schema (name, type, required, default)

👥 Role-based permissions

Whenever a model is created or updated, the backend automatically:

Saves the JSON definition.

Rebuilds the Sequelize model dynamically.

Syncs it with MySQL, creating or updating the corresponding table.

🧠 How Dynamic API Endpoints Work
After publishing, DUBUDDY automatically generates the following REST endpoints for each model:

Method	Endpoint	Description	Access
GET	/api/<model>	Fetch all records	Read
GET	/api/<model>/:id	Fetch record by ID	Read
POST	/api/<model>	Create new record	Create
PUT	/api/<model>/:id	Update record	Update
DELETE	/api/<model>/:id	Delete record	Delete

Example:
If you publish a model called Employee, you automatically get:

http
Copy code
GET    /api/employees
GET    /api/employees/:id
POST   /api/employees
PUT    /api/employees/:id
DELETE /api/employees/:id
Each route verifies the user’s role and permissions via RBAC rules from the model JSON.

🔄 How Model Syncing Works
When you publish or update a model:

Sequelize uses sync({ alter: true }) to ensure MySQL table structure matches your model.

Field names are automatically trimmed (fixes "salary " errors).

Numeric defaults are safely typecast (avoids ER_INVALID_DEFAULT).

🌐 API Summary
Endpoint	Description	Access
POST /api/models/create-model	Publish new model	Admin only
GET /api/models/get-models	Get all available models	All roles
PUT /api/models/update-model/:name	Update existing model	Admin only
DELETE /api/models/delete-model/:name	Delete model	Admin only

💡 Example Flow
Login as Admin

Publish a model named Employee

Backend creates:

dynamicModels/Employee.json

MySQL table employees

Frontend fetches this model automatically

You can immediately call:

GET http://localhost:5000/api/employees
Or create new records:

POST http://localhost:5000/api/employees
🎨 Frontend UI Highlights
🖤 Unified gradient theme: from-slate-900 via-slate-800 to-gray-900

🪄 Transparent Navbar with smooth scroll color change

💎 Centered Cards for models with glowing hover effects

⚡ Animated Buttons and responsive layout

📦 Example Folder Structure (Dynamic Models)

backend/
 ├── dynamicModels/
 │    ├── Employee.json
 │    ├── Product.json
 │    └── Student.json
Each file instantly generates its own CRUD API at runtime:

/api/employees

/api/products

/api/students

🧱 Technologies Summary
Category	Technology
Frontend	React, TypeScript, TailwindCSS
Backend	Node.js, Express.js
Database	MySQL + Sequelize ORM
Auth	JWT (JSON Web Tokens)
Access Control	Role-Based (Admin / Manager / Viewer)
Dynamic Schema	JSON + Sequelize

🧩 Example JSON Schema
json
Copy code
{
  "name": "Student",
  "fields": [
    { "name": "rollNo", "type": "integer", "required": true },
    { "name": "name", "type": "string", "required": true },
    { "name": "course", "type": "string" }
  ],
  "rbac": {
    "Admin": ["all"],
    "Manager": ["update", "read"],
    "Viewer": ["read"]
  }
}
