import mongoose from "mongoose";

const { model, models, Schema } = mongoose;

const OrderSchema = new Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    products: [{ type: [mongoose.Schema.Types.Mixed], default: [] }],
    paid: {type: Boolean, default: false},
});

const Order = models.Order || model('Order', OrderSchema);

export default Order;