import { Request, Response } from "express";
import { UserServices } from "./user.service";

 

const createUser = async (req: Request, res: Response) => {
    console.log("create contonner inner")
    try {
        const result = await UserServices.createUser(req.body)
        res.status(201).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const getAllFromDB = async (req: Request, res: Response) => {
    try {
        const result = await UserServices.getAllFromDB()
        res.status(201).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const getUserById = async (req: Request, res: Response) => {
    try {
        const result = await UserServices.getUserById(Number(req.params.id))
        res.status(201).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const updateUser = async (req: Request, res: Response) => {
    try {
        const result = await UserServices.updateUser(Number(req.params.id), req.body)
        res.status(201).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const deleteUser = async (req: Request, res: Response) => {
    try {
        const result = await UserServices.deleteUser(Number(req.params.id))
        res.status(201).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

export const UserController = {
    createUser,
    getAllFromDB,
    getUserById,
    updateUser,
    deleteUser
}