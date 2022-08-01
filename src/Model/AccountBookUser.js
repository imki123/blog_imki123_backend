import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const { Schema } = mongoose
const UserSchema = new Schema({
  username: String,
  email: String,
})

//이메일 체크
UserSchema.methods.checkEmail = async function (email) {
  const allowedEmails = process.env.ALLOWED_EMAIL_FOR_ACCOUNT_BOOK.split(',')
  console.log('email:', email)

  return allowedEmails.includes(email)
}
//토큰 발급하기
UserSchema.methods.generateToken = function () {
  const token = jwt.sign(
    {
      //모델에 들어있는 유저 데이터
      username: this.username,
      email: this.email,
    },
    process.env.JWT_SECRET, //JWT 암호
    {
      expiresIn: '7d', //7일동안 유효함
    },
  )
  return token
}

export const AccountBookUser = mongoose.model('AccountBookUser', UserSchema)
// Collection name 'AccountBookUser' will change to 'accountbookusers'
