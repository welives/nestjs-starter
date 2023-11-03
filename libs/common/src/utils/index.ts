import crypto from 'node:crypto'
import { Request } from 'express'
const singletonEnforcer = Symbol()
class Utils {
  private static _instance: Utils
  constructor(enforcer: any) {
    if (enforcer !== singletonEnforcer) {
      throw new Error('Cannot initialize Utils single instance')
    }
  }
  static get instance() {
    // 如果已经存在实例则直接返回, 否则实例化后返回
    this._instance || (this._instance = new Utils(singletonEnforcer))
    return this._instance
  }
  /**
   * 获取请求信息
   */
  getReqForLogger(req: Request): Record<string, any> {
    const { url, headers, method, body, params, query, connection } = req
    const xRealIp = headers['X-Real-IP']
    const xForwardedFor = headers['X-Forwarded-For']
    const { ip: cIp } = req
    const { remoteAddress } = connection || {}
    const ip = xRealIp || xForwardedFor || cIp || remoteAddress
    return {
      url,
      host: headers.host,
      ip,
      method,
      body,
      params,
      query,
    }
  }
  /** 生成加密盐 */
  genSalt() {
    return crypto.randomBytes(16).toString('base64')
  }
  /**
   * 密码加密
   * @param password 原密码
   * @param salt 加密盐
   */
  encryptPassword(password: string, salt: string) {
    if (!password || !salt) {
      throw new Error('password or salt is empty')
    }
    const tempSalt = Buffer.from(salt, 'base64')
    return crypto.createHmac('sha256', tempSalt).update(password).digest('hex')
  }
}

export default Utils.instance
