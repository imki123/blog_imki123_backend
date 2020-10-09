const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const { Schema } = mongoose
const UserSchema = new Schema({
	username: String,
	hashedPassword: String,
	email: String,
	imageUrl: String,
	oAuth: { type: Boolean, default: false },
})
//인스턴스 메서드
UserSchema.methods.setPassword = async function (password) {
	//해시비밀번호 생성
	const hash = await bcrypt.hash(password, 10)
	this.hashedPassword = hash
}
UserSchema.methods.checkPassword = async function (password) {
	//비밀번호 체크
	const result = await bcrypt.compare(password, this.hashedPassword)
	return result //true / false
}
UserSchema.methods.serialize = function () {
	//유저데이터에서 비밀번호 지우기
	const data = this.toJSON()
	delete data.hashedPassword
	return data
}
UserSchema.methods.generateToken = function () {
	//토큰 발급하기
	const token = jwt.sign(
		{
			//유저 데이터
			_id: this.id,
			username: this.username,
			email: this.email,
			imageUrl: this.imageUrl,
			oAuth: this.oAuth,
		},
		process.env.JWT_SECRET, //JWT 암호
		{
			expiresIn: '7d', //7일동안 유효함
		},
	)
	return token
}
UserSchema.methods.deleteByUsername = function (username) {
	//유저네임으로 회원탈퇴하기
	return this.deleteOne({ username })
}

//스태틱 메서드
UserSchema.statics.findByUsername = async function (username) {
	return this.findOne({ username })
}

const User = mongoose.model('User', UserSchema)
module.exports = User
