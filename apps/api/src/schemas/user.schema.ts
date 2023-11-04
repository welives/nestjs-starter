import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export enum UserStatus {
  NORMAL = 0, // 正常
  LOCKED = 1, // 锁定
  BANNED = 2, // 封禁
}

export type UserDocument = User & Document

@Schema({ versionKey: false })
export default class User extends Document {
  @Prop({ required: true, unique: true })
  username: string
  @Prop({ required: true })
  password: string
  @Prop({ required: true })
  salt: string
  @Prop({ default: '' })
  avatar: string
  @Prop({ default: 0 })
  role: number
  @Prop({ default: UserStatus.NORMAL, enum: UserStatus })
  status: UserStatus
}
export const UserSchema = SchemaFactory.createForClass(User)
