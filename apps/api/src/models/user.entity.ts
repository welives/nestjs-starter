import { Entity, Column, ObjectId, ObjectIdColumn } from 'typeorm'
export enum UserStatus {
  NORMAL = 0, // 正常
  LOCKED = 1, // 锁定
  BANNED = 2, // 封禁
}
@Entity({ name: 'user' })
export default class User {
  @ObjectIdColumn()
  id: ObjectId
  @Column({ type: 'string', comment: '用户名' })
  username: string
  @Column({ type: 'string', comment: '密码' })
  password: string
  @Column({ type: 'string', comment: '加密盐' })
  salt: string
  @Column({ type: 'string', default: '', comment: '头像' })
  avatar: string
  @Column({ type: 'number', default: 0, comment: '角色' })
  role: number
  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.NORMAL, comment: '状态' })
  status: UserStatus
}
