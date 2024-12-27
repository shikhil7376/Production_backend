import express from 'express'
import UserRepository from '../repository/userRepository'
import UserUseCase from '../../useCase/userUsecase'
import UserController from '../../adapters/userController'
import EncryptPassword from '../services/bcryptPassword'
import GenerateOtp from '../services/generateOtp'
import EmailService from '../services/emailService'
import JWTTOKEN from '../services/generateToken'
import { userAuth } from '../middleware/userAuth'
import Cloudinary from '../services/cloudinary'
import upload from '../services/multer'



//services
 const generateOtp = new GenerateOtp()
 const encryptPassword = new EncryptPassword()
 const generateEmail = new EmailService()
 const jwtToken = new JWTTOKEN()
 const cloudinary = new Cloudinary()

// repositories
const userRepository = new UserRepository()

// useCases
const userCase  = new UserUseCase(userRepository,encryptPassword,jwtToken,generateOtp,generateEmail, cloudinary )

// controllers
const userController = new UserController(userCase)

const route = express.Router()


route.post('/google',(req,res,next)=>userController.googleAuth(req,res,next))
route.post('/sign_up',(req,res,next)=>userController.signUp(req,res,next))
route.post('/verify',(req,res,next)=>userController.verifyOtp(req,res,next))
route.post('/resendotp',(req,res,next)=>userController.resendOtp(req,res,next))
route.post('/login',(req,res,next)=>userController.login(req,res,next))
route.post('/forgotpassword',(req,res,next)=>userController.forgotPassword(req,res,next))
route.post('/verify-fotp',(req,res,next)=>userController.verifyfotp(req,res,next))
route.post('/verify-fresendotp',(req,res,next)=>userController.verifyforgotResendotp(req,res,next))
route.post('/resetpassword',(req,res,next)=>userController.resetPassword(req,res,next))
route.get('/getprofile/:Id',userAuth,(req,res,next)=>userController.getProfile(req,res,next))
route.post('/edit-profile',userAuth,upload.single('userimage'),(req,res,next)=>userController.editProfile(req,res,next))
route.post('/add-post',userAuth,upload.array('postimages',3),(req,res,next)=>userController.addPost(req,res,next))
route.get('/get-posts',userAuth,(req,res,next)=>userController.getPosts(req,res,next))
route.post('/like-post/:postId',userAuth,(req,res,next)=>userController.likePost(req,res,next))
route.post('/comment-post',userAuth,(req,res,next)=>userController.commentPost(req,res,next))
route.post('/get-comments',userAuth,(req,res,next)=>userController.getComments(req,res,next))
route.post('/follow',userAuth,(req,res,next)=>userController.follow(req,res,next))
route.post('/user-not-follow',userAuth,(req,res,next)=>userController.userNotFollow(req,res,next))
route.post('/getUsers',userAuth,(req,res,next)=>userController.allUsers(req,res,next))
route.patch('/edit-post/:id',userAuth,upload.array('editPost', 3),(req,res,next)=>userController.editPost(req,res,next))
route.delete('/delete-post/:id',userAuth,(req,res,next)=>userController.deletePost(req,res,next))
route.get('/get-followers/:id',userAuth,(req,res,next)=>userController.getFollowers(req,res,next))
route.get('/get-following/:id',userAuth,(req,res,next)=>userController.getFollowing(req,res,next))
route.post('/report-post',userAuth,(req,res,next)=>userController.reportPost(req,res,next))
route.get('/check-status/:postId/:userId',userAuth,(req,res,next)=>userController.checkReportStatus(req,res,next))

export default route