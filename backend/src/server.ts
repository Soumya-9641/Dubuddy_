// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import { connectDB, sequelize } from "./config/database";
// import authRoutes from "./routes/authRoutes";
// import { User } from "./model/User";

// dotenv.config();
// const app = express();

// app.use(cors());
// app.use(express.json());

// // routes
// app.use("/api/auth", authRoutes);

// // db connect
// connectDB();
// sequelize.sync({ alter: true });

// // start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
import express from "express";
import bodyParser from "body-parser";
import { sequelize } from "./config/database";
import { loadDynamicModels } from "./model/dynamicModelLoader";
import { createCrudRouter } from "./routes/dynamicCrudRouter";
import modelRoutes from "./routes/modelRoutes";
import authRoutes from "./routes/authRoutes";

const app = express();
app.use(bodyParser.json());

app.use("/api/models", modelRoutes);
app.use("/api/auth", authRoutes);

(async () => {
  await sequelize.authenticate();
  console.log("✅ Database connected");
 // await sequelize.sync({ alter: true });
  const models = await loadDynamicModels();

  for (const [name, model] of Object.entries(models)) {
    app.use(`/api/${name.toLowerCase()}s`, createCrudRouter(model, name));
    console.log(`🛠️ Registered routes for /api/${name.toLowerCase()}s`);
  }

  app.listen(3000, () => console.log("🚀 Server running on port 3000"));
})();
