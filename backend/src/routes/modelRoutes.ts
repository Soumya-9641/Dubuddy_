import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { loadDynamicModels } from "../model/dynamicModelLoader";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware";
import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
const router = express.Router();

const dynamicModelPath = path.join(__dirname, "../dynamicModels");


router.post(
  "/create-model",
  verifyToken,
  authorizeRoles("admin"),
  async (req: Request, res: Response) => {
    try {
      const modelDef = req.body;

      if (!modelDef.name || !modelDef.fields) {
        return res.status(400).json({ message: "Invalid model definition" });
      }

      // Save JSON file
      const filePath = path.join(dynamicModelPath, `${modelDef.name}.json`);
      fs.writeFileSync(filePath, JSON.stringify(modelDef, null, 2));

      // ✅ Return response immediately
      res.status(200).json({ message: "Model published successfully" });

      // 🔄 Reload models in background (non-blocking)
      loadDynamicModels()
        .then(() => console.log(`✅ Model ${modelDef.name} loaded successfully`))
        .catch((err) => console.error(`❌ Failed to reload models:`, err));
    } catch (err) {
      console.error("Error creating model:", err);
      return res.status(500).json({ message: "Failed to publish model" });
    }
  }
);


// ✅ UPDATE MODEL — only admin
router.put("/update-model/:name", verifyToken, authorizeRoles("admin"), (req, res) => {
  const modelName = req.params.name;
  const filePath = path.join(dynamicModelPath, `${modelName}.json`);
  if (!fs.existsSync(filePath))
    return res.status(404).json({ message: "Model not found" });

  fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
  res.json({ message: "Model updated successfully" });
});

// ✅ DELETE MODEL — only admin
router.delete("/delete-model/:name", verifyToken, authorizeRoles("admin"), async(req, res) => {
  const modelName = req.params.name;
  const filePath = path.join(dynamicModelPath, `${modelName}.json`);
     if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "Model not found" });
      }
       const modelData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      const attributes: any = {};

      modelData.fields.forEach((field: any) => {
        const attr: any = {};
        switch (field.type) {
          case "string":
            attr.type = DataTypes.STRING;
            break;
          case "number":
            attr.type = DataTypes.INTEGER;
            break;
          case "boolean":
            attr.type = DataTypes.BOOLEAN;
            break;
          default:
            attr.type = DataTypes.STRING;
        }
        attr.allowNull = !field.required;
        if (field.default !== undefined) attr.defaultValue = field.default;
        attributes[field.name] = attr;
      });
       const model = sequelize.define(modelData.name, attributes, {
        tableName: modelData.name.toLowerCase() + "s",
        timestamps: true,
      });

      // 🔹 Step 4: Drop the actual table from DB
      await model.drop();
      console.log(`🗑️ Table "${modelData.name}" dropped successfully.`);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  res.json({ message: "Model deleted successfully" });
});

// ✅ VIEW MODELS — all roles
router.get("/models", verifyToken, authorizeRoles("admin", "manager", "viewer"), (req, res) => {
  const files = fs.readdirSync(dynamicModelPath);
  const models = files.map((file) =>
    JSON.parse(fs.readFileSync(path.join(dynamicModelPath, file), "utf-8"))
  );
  res.json(models);
});

export default router;
