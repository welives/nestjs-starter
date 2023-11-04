import crypto from 'node:crypto'
import { Request } from 'express'
import chalk from 'chalk'
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
  /** 获取请求信息 */
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
  /** 输出环境变量到终端 */
  environmentsOutput() {
    console.log(`
${chalk.yellow('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 环境标识 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')}
NODE_ENV: ${chalk.green(process.env.NODE_ENV)}
${chalk.yellow('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 应用配置 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')}
APP_PORT: ${chalk.green(process.env.APP_PORT)}
JWT_SECRET: ${chalk.green(process.env.JWT_SECRET)}
JWT_EXPIRES_IN: ${chalk.green(process.env.JWT_EXPIRES_IN)}
${chalk.yellow('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 数据库配置 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')}
MYSQL_URL: ${chalk.green(process.env.MYSQL_URL)}
MYSQL_HOST: ${chalk.green(process.env.MYSQL_HOST)}
MYSQL_PORT: ${chalk.green(process.env.MYSQL_PORT)}
MYSQL_USER: ${chalk.green(process.env.MYSQL_USER)}
MYSQL_PWD: ${chalk.green(process.env.MYSQL_PWD)}
MYSQL_DBNAME: ${chalk.green(process.env.MYSQL_DBNAME)}
${chalk.yellow('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Redis配置 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')}
REDIS_PORT: ${chalk.green(process.env.REDIS_PORT)}
REDIS_HOST: ${chalk.green(process.env.REDIS_HOST)}
REDIS_UERNAME: ${chalk.green(process.env.REDIS_UERNAME)}
REDIS_PWD: ${chalk.green(process.env.REDIS_PWD)}
${chalk.yellow('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 其他配置 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')}
CHARSET: ${chalk.green(process.env.CHARSET)}
TIMEZONE: ${chalk.green(process.env.TIMEZONE)}`)
  }
}

export default Utils.instance
