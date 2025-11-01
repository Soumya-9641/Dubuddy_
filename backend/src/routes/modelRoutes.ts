import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { loadDynamicModels } from "../model/dynamicModelLoader";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware";
import { DataTypes, ModelAttributes, ModelAttributeColumnOptions } from "sequelize";
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
      modelDef.name = modelDef.name.trim();
      modelDef.fields = modelDef.fields.map((field: any) => ({
        ...field,
        name: field.name.trim(),
      }));
      const filePath = path.join(dynamicModelPath, `${modelDef.name}.json`);
      fs.writeFileSync(filePath, JSON.stringify(modelDef, null, 2));

     
      res.status(200).json({ message: "Model published successfully" });

 
      loadDynamicModels()
        .then(() => console.log(`✅ Model ${modelDef.name} loaded successfully`))
        .catch((err) => console.error(`❌ Failed to reload models:`, err));
    } catch (err) {
      console.error("Error creating model:", err);
      return res.status(500).json({ message: "Failed to publish model" });
    }
  }
);

interface Field {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string | number | null;
}

interface ModelDefinition {
  name: string;
  fields: Field[];
  ownerField: string;
  rbac: Record<string, string[]>;
}


router.put(
  "/update-model/:name",
  verifyToken,
  authorizeRoles("admin"),
  async (req: Request, res: Response) => {
    try {
      const modelName = req.params.name.trim();
      const modelFiles = fs.readdirSync(dynamicModelPath);
      const modelFile = modelFiles.find(
        (file) => file.toLowerCase() === `${modelName.toLowerCase()}.json`
      );

      if (!modelFile) {
        return res.status(404).json({ message: "Model not found" });
      }

      const filePath = path.join(dynamicModelPath, modelFile);
      const updatedData: ModelDefinition = req.body;
      updatedData.name = updatedData.name.trim();
      updatedData.fields = updatedData.fields.map((field) => ({
        ...field,
        name: field.name.trim(), 
      }));
   
      updatedData.fields = updatedData.fields.map((field) => {
        if (
          ["integer", "number", "float", "double"].includes(
            field.type.toLowerCase()
          )
        ) {
          if (field.defaultValue === "" || field.defaultValue === null) {
            delete field.defaultValue;
          } else {
            field.defaultValue = Number(field.defaultValue);
          }
        }
        return field;
      });

   
      fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2));
      console.log(`📄 Model JSON "${modelFile}" updated.`);

   
      const attributes: ModelAttributes = {};
      updatedData.fields.forEach((field) => {
        const attr: any = {};

        switch (field.type.toLowerCase()) {
          case "string":
            attr.type = DataTypes.STRING;
            break;
          case "number":
          case "integer":
            attr.type = DataTypes.INTEGER;
            break;
          case "boolean":
            attr.type = DataTypes.BOOLEAN;
            break;
          default:
            attr.type = DataTypes.STRING;
        }

        attr.allowNull = !field.required;
        if (field.defaultValue !== undefined) attr.defaultValue = field.defaultValue;

        attributes[field.name.trim()] = attr;
      });

      
      const model = sequelize.define(updatedData.name, attributes, {
        tableName: updatedData.name.toLowerCase() + "s",
        timestamps: true,
      });

      await model.sync({ alter: true });
      console.log(`✅ Table "${updatedData.name}" updated and synced.`);

      res.json({
        message: `Model "${updatedData.name}" updated successfully and synced with database.`,
      });
    } catch (error: any) {
      console.error("❌ Error updating model:", error);
      res.status(500).json({
        message: "Error updating model",
        error: error.message,
      });
    }
  }
);


router.delete("/delete-model/:name", verifyToken, authorizeRoles("admin"), async (req, res) => {
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

  await model.drop();
  console.log(`🗑️ Table "${modelData.name}" dropped successfully.`);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  res.json({ message: "Model deleted successfully" });
});

router.get("/models", verifyToken, authorizeRoles("admin", "manager", "viewer"), (req, res) => {
  const files = fs.readdirSync(dynamicModelPath);
  const models = files.map((file) =>
    JSON.parse(fs.readFileSync(path.join(dynamicModelPath, file), "utf-8"))
  );
  res.json(models);
});


router.get("/get-models", async (req: Request, res: Response) => {
  try {
    const modelFiles = fs.readdirSync(dynamicModelPath).filter(file => file.endsWith(".json"));

    const models: any[] = [];

    for (const file of modelFiles) {
      const modelDef = JSON.parse(fs.readFileSync(path.join(dynamicModelPath, file), "utf-8"));
      const tableName = modelDef.name.toLowerCase() + "s";

     
      const [results] = await sequelize.query(
        `SHOW TABLES LIKE '${tableName}';`
      );

      models.push({
        name: modelDef.name,
        fields: modelDef.fields,
        existsInDatabase: (results as any[]).length > 0,
      });
    }

    return res.status(200).json({
      message: "All models fetched successfully",
      total: models.length,
      models,
    });
  } catch (error) {
    console.error("❌ Error fetching models:", error);
    return res.status(500).json({ message: "Failed to fetch models" });
  }
});
router.get("/get-model/:name", verifyToken, authorizeRoles("admin", "manager", "viewer"), async (req: Request, res: Response) => {
  try {
    const { name } = req.params;

    const modelFile = fs
      .readdirSync(dynamicModelPath)
      .find((file) => file.toLowerCase() === `${name.toLowerCase()}.json`);

    if (!modelFile) {
      return res.status(404).json({ message: "Model not found" });
    }

    const modelDef = JSON.parse(
      fs.readFileSync(path.join(dynamicModelPath, modelFile), "utf-8")
    );

    const tableName = modelDef.name.toLowerCase() + "s";

    const [results] = await sequelize.query(`SHOW TABLES LIKE '${tableName}';`);
    const existsInDatabase = (results as any[]).length > 0;

 
    let records: any[] = [];
    if (existsInDatabase) {
      const [rows] = await sequelize.query(`SELECT * FROM ${tableName} LIMIT 5;`);
      records = rows as any[];
    }

    return res.status(200).json({
      message: "Model fetched successfully",
      model: {
        name: modelDef.name,
        fields: modelDef.fields,
        existsInDatabase,
        sampleRecords: records,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching model:", error);
    return res.status(500).json({ message: "Failed to fetch model" });
  }
});
export default router;
