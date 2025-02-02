import { Request,Response,NextFunction } from "express";
import  jwt ,{ JwtPayload } from "jsonwebtoken";
import UserModel from "../database/userModel";
import { Role } from "../../utils/enums";

export const userAuth = async(req:Request,res:Response,next:NextFunction)=>{
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authorization header missing or invalid" });
      }
      const token = authHeader.split(" ")[1];
 
    try {

        const decodedToken = jwt.verify(token,process.env.JWT_SECRET_KEY as string) as JwtPayload
        if (decodedToken.role !== Role.user) {
            return res.status(400).json({ message: "Unauthorized access" });
          }

          const userId = decodedToken.userId;
          const user = await UserModel.findById(userId);
          if (!user) {
            return res.status(400).json({ message: "User not found" });
          }
      
          if (user.isBlocked) {
            return res.status(403).json({ message: "User is blocked", accountType: "user" });
          }
          next()
    } catch (error:any) {
        console.error('error decoding token:',error.message)
        return res.status(401).json({message:'invalid token'})
    }
}