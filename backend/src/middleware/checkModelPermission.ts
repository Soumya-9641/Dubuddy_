import fs from "fs";
import path from "path";
import { Request, Response, NextFunction } from "express";

const dynamicModelPath = path.join(__dirname, "../dynamicModels"); // adjust path if needed

export const checkModelPermission = (modelName: string,
action: "create" | "read" | "update" | "delete") => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
     // const modelName = req.params.modelName || req.body.modelName;
      //console.log(modelName);
      const userRole = (req as any).user?.role;
      console.log(userRole);

      if (!modelName || !userRole) {
        return res.status(400).json({ message: "Missing model name or user role" });
      }

      const modelFile = path.join(dynamicModelPath, `${modelName}.json`);
      if (!fs.existsSync(modelFile)) {
        return res.status(404).json({ message: "Model not found" });
      }

      const modelDef = JSON.parse(fs.readFileSync(modelFile, "utf-8"));
      const permissions = modelDef.rbac || {};
      console.log(permissions);
       const matchedRoleKey = Object.keys(permissions).find(
        (key) => key.toLowerCase() === userRole.toLowerCase()
      );

      const allowedActions = matchedRoleKey ? permissions[matchedRoleKey] : [];
      console.log("✅ Allowed actions:", allowedActions);

      // ✅ If "all" is specified, grant full access
      if (allowedActions.includes("all") || allowedActions.includes(action)) {
        return next();
      }

      return res.status(403).json({ message: "Access denied: insufficient permissions" });
    } catch (error) {
      console.error("Permission check error:", error);
      return res.status(500).json({ message: "Permission check failed" });
    }
  };
};
