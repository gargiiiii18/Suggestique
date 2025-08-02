import mongoose, { model, models, Schema } from 'mongoose';

const userSchema = new Schema({
    email: {type: String, required: [true, "Please enter your email"], unique: true},
    address: Object,
    password: {type:String, required: [true, "Please enter your password"]},
    cart: [
        {
            productId: {type: mongoose.Schema.Types.ObjectId, ref: "Product"},
            quantity: {type: Number, default: 1}
        }
    ],
    isVerified: {type:Boolean, default: false},
    forgotPwdToken: String,
    forgotPwdTokenExpiry: Date,
    verifyToken: String,
    verifyTokenExpiry: Date
});

const User = models.User || model('User', userSchema);

export default User;

