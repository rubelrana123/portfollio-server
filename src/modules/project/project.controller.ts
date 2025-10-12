import { Request, Response } from "express";
import { ProjectService } from "./project.service";
 

const createProject = async (req: Request, res: Response) => {
    try {
        const result = await ProjectService.createProject(req.body)
        res.status(201).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = (req.query.search as string) || "";
    const isFeatured = req.query.isFeatured ? req.query.isFeatured === "true" : undefined;
    const features = req.query.features ? (req.query.features as string).split(",") : [];

    const result = await ProjectService.getAllProjects({
      page,
      limit,
      search,
      isFeatured,
    //   feature,
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch projects", details: err });
  }
};



const getProjectById = async (req: Request, res: Response) => {
    const project = await ProjectService.getProjectById(Number(req.params.id));
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
};

const updateProject = async (req: Request, res: Response) => {
    const project = await ProjectService.updateProject(Number(req.params.id), req.body);
    res.json(project);
};

const deleteProject = async (req: Request, res: Response) => {
    await ProjectService.deleteProject(Number(req.params.id));
    res.json({ message: "Project deleted" });
};

// const getBlogStats = async (req: Request, res: Response) => {
//     try {
//         const result = await ProjectService.getProjectStats();
//         console.log(result)
//         res.json(result);
//     } catch (err) {
//         res.status(500).json({ error: "Failed to fetch stats", details: err });
//     }
// };

export const ProjectController = {
    createProject,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject,
    // getBlogStats
}