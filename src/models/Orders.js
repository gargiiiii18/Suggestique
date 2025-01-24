const { model, models, Schema } = require("mongoose");

const OrderSchema = new Schema({
    product: Object,
    address: Object,
    email: String,
    paid: {type: Boolean, default: false},
});

const Order = models.Order || model('Order', OrderSchema);

export default Order;