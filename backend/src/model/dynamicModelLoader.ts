import fs from "fs";
import path from "path";
import { DataTypes, Model, ModelStatic } from "sequelize";
import { sequelize } from "../config/database";
import { ModelDefinition } from "../types/modelDefinition";

const dynamicModelPath = path.join(__dirname, "../dynamicModels");

// ✅ Ensure directory exists before scanning
if (!fs.existsSync(dynamicModelPath)) {
  fs.mkdirSync(dynamicModelPath, { recursive: true });
  console.log("🆕 Created directory:", dynamicModelPath);
}

export const loadDynamicModels = async (): Promise<
  Record<string, ModelStatic<Model>>
> => {
  const models: Record<string, ModelStatic<Model>> = {};

  // ✅ Safely read directory contents
  const files = fs.existsSync(dynamicModelPath)
    ? fs.readdirSync(dynamicModelPath)
    : [];

  if (files.length === 0) {
    console.log("⚠️ No dynamic models found in:", dynamicModelPath);
    return models;
  }

  for (const file of files) {
    const filePath = path.join(dynamicModelPath, file);

    try {
      const modelData: ModelDefinition = JSON.parse(
        fs.readFileSync(filePath, "utf-8")
      );

      console.log(`📦 Loading model: ${modelData.name}`);

      const attributes: any = {};

      // ✅ Use your improved switch-based mapping logic
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
          case "float":
            attr.type = DataTypes.FLOAT;
            break;
          case "date":
            attr.type = DataTypes.DATE;
            break;
          case "text":
            attr.type = DataTypes.TEXT;
            break;
          default:
            console.warn(
              `⚠️ Unknown field type "${field.type}", defaulting to STRING`
            );
            attr.type = DataTypes.STRING;
        }

        attr.allowNull = !field.required;

        if (field.default !== undefined) {
          attr.defaultValue = field.default;
        }

        if (field.unique) {
          attr.unique = true;
        }

        attributes[field.name] = attr;
      });

      const model = sequelize.define(modelData.name, attributes, {
        tableName: modelData.name.toLowerCase() + "s",
        timestamps: true,
      });

      await model.sync({ alter: true }); // ✅ Auto-create table
      models[modelData.name] = model;

      console.log(`✅ Model "${modelData.name}" loaded & table synced`);
    } catch (err: any) {
      console.error(`❌ Failed to load model from file: ${file}`, err.message);
    }
  }

  return models;
};
