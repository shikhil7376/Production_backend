import { Request,Response,NextFunction } from "express";
import KennelUseCase from "../useCase/Kennel/kennelUsecase";
import { UserDetails } from "../domain/user";

class kennelController{
    private kennelusecase
    constructor(KennelUseCase:KennelUseCase){
       this.kennelusecase = KennelUseCase
    }

   async signUp(req:Request,res:Response,next:NextFunction){
    try {
        const {name,email,password,phone} = req.body
        let data:UserDetails = { name, email, password, phone };
        const verifyKennel = await this.kennelusecase.checkExists(email)
        if(verifyKennel.data.status == true){
            const sendOtp = await this.kennelusecase.signup(data)
            return res.status(sendOtp.status).json(sendOtp.data)
        }else{
            return res.status(verifyKennel.status).json(verifyKennel.data)
        }
    } catch (error) {
        next(error)
    }
   }
 
   async verifyOtp(req:Request,res:Response,next:NextFunction){
        try {
            const {email,otp} = req.body
            let verify = await this.kennelusecase.verifyOtp(email,otp)
            if(verify.status ==400){
                return res.status(verify.status).json({message:verify.message})
            }
             if(verify.status ==200){
                console.log('verify.data',verify.data);
                let save = await this.kennelusecase.verifyKennelOwner(verify.data as UserDetails)
                if(save){
                    return res.status(save.status).json(save)
                }
            }
        } catch (error) {
            next(error)
        }
   }
  
   async login(req:Request,res:Response,next:NextFunction){
    try { 
        const {email,password} = req.body 
        const user = await this.kennelusecase.login(email,password)      
        return res.status(user.status).json(user.data)
    } catch (error) {
      next(error)
    }
}

async resendOtp(req:Request,res:Response,next:NextFunction){
    try { 
     const {name,email,password,phone} = req.body
     let data:UserDetails = { name, email, password, phone };
     const resendotp = await this.kennelusecase.resendOtp(data)
       if(resendotp.status==200){
          res.status(resendotp.status).json(resendotp.data.message)
       }
    } catch (error) {
       next(error)
    }
}

async getProfile(req:Request,res:Response,next:NextFunction){
    try {
        const {Id} = req.body 
        const response = await this.kennelusecase.getProfile(Id) 
        return res.status(response.status).json(response.data)
    } catch (error) {
       next(error) 
    }
}

async addKennel(req:Request,res:Response,next:NextFunction){
    try {            
       const {kennelname,location,description,phone,type,maxCount,PricePerNight,ownerId} = req.body
       const locationObject= JSON.parse(location);

       const data ={
        kennelname:kennelname,
        location: {
            lat: locationObject.lat,     
            lng: locationObject.lng,     
            address: locationObject.address 
        },
        description:description,
        phone:phone,
        type:type,
        maxcount:maxCount,
        pricepernight:PricePerNight,
        ownerId:ownerId
       }

       console.log('data...',data);
       
        const images =  req.files as Express.Multer.File[];
     const imagepath = images.map((val)=>val.path)  
     const response = await this.kennelusecase.addCage(data,imagepath)
      return res.status(response.status).json(response.message)
    } catch (error) {
        next(error)
    }
}

async getCages(req:Request,res:Response,next:NextFunction){
    try {
        const data = await this.kennelusecase.getCages()                
       return  res.status(data.status).send(data.data)
    } catch (error) {
        next(error)
    }
}

async viewDetails(req:Request,res:Response,next:NextFunction){
    try {
        const {Id} = req.body
        const response = await this.kennelusecase.getSingleCage(Id) 
        return res.status(response.status).json(response.data)
    } catch (error) {
        next(error)
    }
}

async booking(req:Request,res:Response,next:NextFunction){
    try {           
        
       const{details,userid,email,fromdate,todate,totalAmount,totalDays} = req.body       
      const paymentData ={
         details,
         userid,
         email,
         fromdate,
         todate,
         totalAmount,
         totalDays
      }
      
        const response = await this.kennelusecase.booking(details,userid,fromdate,todate,totalAmount,totalDays)  
         if(response){
            res.status(response.status).json(response.message)
         }
    } catch (error) {
        next(error)
    }
}

async getOwnersCage(req:Request,res:Response,next:NextFunction){
    try {
       const {Id} = req.body
            const page = parseInt(req.query.page as string)|| 1
             const limit = parseInt(req.query.limit as string) || 10
             const searchTerm = req.query.search as string || '' 
        const response = await this.kennelusecase.getOwnersCage(Id,page,limit,searchTerm)
        if(response.status==200){
            return res.status(response.status).json(response)
        }else{
            return res.status(response.status).json(response.message)
        }
    } catch (error) {
        next(error)
    }
}

async editCage(req:Request,res:Response,next:NextFunction){
     try { 
        const { id, kennelname, location, description, phone, type, maxCount, PricePerNight, ownerId } = req.body;
        
        const locationObject= JSON.parse(location);
        const images =  req.files as Express.Multer.File[];  
        const imagePaths = images.map((val) => val.path);
        const existingCage = await this.kennelusecase.getCageById(id)
        if(!existingCage.data?.data){
            return res.status(404).json({message:'Cage not found'})
        }
        
        const updatedData = {
            kennelname: kennelname || existingCage.data.data.kennelname,
            location: {
                lat: locationObject.lat ?? existingCage.data.data.location?.lat,
                lng: locationObject.lng ?? existingCage.data.data.location?.lng,
                address: locationObject.address ?? existingCage.data.data.location?.address,
            },
            description: description || existingCage.data.data.description,
            phone: phone || existingCage.data.data.phone,
            type: type || existingCage.data.data.type,
            maxcount: Number(maxCount) || existingCage.data.data.maxcount,
            pricepernight: Number(PricePerNight) || existingCage.data.data.pricepernight,
            ownerId: ownerId || existingCage.data.data.ownerId,
          };
          const existingImages = existingCage.data.data.image || [];
          let finalImages = existingImages;
          const response = await this.kennelusecase.editCage(id,updatedData,imagePaths,finalImages)  
          return res.status(response.status).json(response.message)
     } catch (error) {
        next(error)
     }
}

async editProfile(req:Request,res:Response,next:NextFunction){
   try {
      const {id,name,email,phone} = req.body
      const image =  req.file?.path
      const ownerdata = await this.kennelusecase.findById(id)
      if(!ownerdata.data){
        res.status(404).json({message:'owner not found'})
      }

      const updatedData = {
        email:email || ownerdata.data?.email,
        name:name || ownerdata.data?.name,
        phone:phone || ownerdata.data?.phone
      }
      const response = await this.kennelusecase.editProfile(id,updatedData,image||'')
      return res.status(response.status).json(response.message)
      
   } catch (error) {
      next(error)
   }
   
}

async getBookings(req:Request,res:Response,next:NextFunction){
    try {
      const{userid} = req.body
       const response = await this.kennelusecase.getbookings(userid)
       return res.status(response.status).json(response.data)
    } catch (error) {
        next(error)
    }

}

async cancelBooking(req:Request,res:Response,next:NextFunction){
    try {
       const{bookingid,cageid} = req.body
       const response = await this.kennelusecase.cancelBooking(bookingid,cageid)
       return res.status(response.status).json(response.data)
    } catch (error) {
        next(error)
    }

}


async handleWebhook(req:Request,res:Response,next:NextFunction){
   try {  

    console.log('weboooo');
    
    const sig: string | string[] | undefined = req.headers['stripe-signature'];
    if (!sig || Array.isArray(sig)) {
        return res.status(400).send("Invalid Stripe signature");
    }
    const response = await this.kennelusecase.handleEvent(sig,req.body)
   } catch (error) {
    
   }
}

async getAllBookings(req:Request,res:Response,next:NextFunction){
  try {
     const response = await this.kennelusecase.getAllBookings()
     console.log(response.data.data);
     
     return res.status(response.status).json(response.data.data)
  } catch (error) {
    next(error)
  }
}

async getDashboard(req:Request,res:Response,next:NextFunction){
  try {
    const {ownerId} = req.body
    const response = await this.kennelusecase.getDashboard(ownerId)
    return res.status(response.status).json(response.data)
  } catch (error) {
    next(error)
  }

}

}



export default kennelController