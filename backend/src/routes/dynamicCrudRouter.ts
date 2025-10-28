import express from "express";
import { Model, ModelStatic } from "sequelize";

export const createCrudRouter = <T extends Model>(model: ModelStatic<T>, modelName: string) => {
  const router = express.Router();

  // Create
  router.post("/", async (req, res) => {
    try {
      const item = await model.create(req.body);
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: err });
    }
  });
  router.get("/testing", async(req,res) => {
    res.json({message: `CRUD router for ${modelName} is working!`});
  });

  // Read All
  router.get("/", async (req, res) => {
    try {
      const items = await model.findAll();
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: err });
    }
  });

  // Read One
  router.get("/:id", async (req, res) => {
    try {
      const item = await model.findByPk(req.params.id);
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: err });
    }
  });

  // Update
  router.put("/:id", async (req, res) => {
    try {
      const item = await model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ message: "Not found" });

      await item.update(req.body);
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: err });
    }
  });

  // Delete
  router.delete("/:id", async (req, res) => {
    try {
      const item = await model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ message: "Not found" });

      await item.destroy();
      res.json({ message: "Deleted" });
    } catch (err) {
      res.status(500).json({ error: err });
    }
  });

  return router;
};
