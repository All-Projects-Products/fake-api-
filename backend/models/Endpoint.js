import mongoose from 'mongoose';

const endpointSchema = new mongoose.Schema({
  endpointId: {
    type: String,
    required: true,
    unique: true,
  },
  rowCount: {
    type: Number,
    default: 10,
  },
  fields: [
    {
      fieldName: { type: String, required: true },
      dataType: { type: String, required: true },
    },
  ],
}, { timestamps: true });

const Endpoint = mongoose.model('Endpoint', endpointSchema);

export default Endpoint;
