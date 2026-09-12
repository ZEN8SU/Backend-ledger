import mongoose , {Schema} from 'mongoose'
const ledgerSchema = new Schema({
  account : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Account",
    required : [true , "Ledger must be associated with an account"],
    index : true,
    immutable : true
  },
  amount :{
    type : Number ,
    required : [true , "Amount is required for creating a ledger entry"],
    immutable : true
  },
  transaction :{
    type : mongoose.Schema.Types.ObjectId,
    ref : "Transaction" ,
    required : [true , "Ledger must be associated with transaction"],
    index : true ,
    immutable : true
  },
  type :{
    type : String,
    enum : {
      values :["CREDIT" , "DEBIT"],
      message :"Type can be either CREDIT or DEBIT"
    },
    required :[ true ,"Ledger type is required"],
    immutable :  true
  },
  balanceAfter :{
    type : String , immutable : true
  }
} , {timestamps : true})

function preventLedgerModification(){
  throw new ApiError(403 , "Ledger entries are immutable and cannot be modified or deleted !!")
}
ledgerSchema.pre('findOneAndDelete',preventLedgerModification);
ledgerSchema.pre('findOneAndUpdate',preventLedgerModification);
ledgerSchema.pre('findOneAndReplace',preventLedgerModification);
ledgerSchema.pre('updateOne',preventLedgerModification);
ledgerSchema.pre('deleteOne',preventLedgerModification);
ledgerSchema.pre('remove',preventLedgerModification);
ledgerSchema.pre('deleteMany',preventLedgerModification);
ledgerSchema.pre('updateMany',preventLedgerModification);

export const Ledger = mongoose.model('Ledger' , ledgerSchema);
