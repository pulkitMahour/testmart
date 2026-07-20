import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as bcrypt from 'bcryptjs';

export type UserDocument = HydratedDocument<User>;

@Schema({ _id: false })
export class Address {
  @Prop() street: string;
  @Prop() city: string;
  @Prop() postalCode: string;
  @Prop() country: string;
}
const AddressSchema = SchemaFactory.createForClass(Address);

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: String, enum: ['user', 'admin'], default: 'user' })
  role: string;

  @Prop({ type: AddressSchema, default: {} })
  address: Address;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Hash the password whenever it is set/changed. create() and save() trigger this;
// insertMany() does NOT, so always seed/create users via create()/save().
UserSchema.pre('save', async function (this: UserDocument) {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
