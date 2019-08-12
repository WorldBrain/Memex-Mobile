import { DefaultNamingStrategy, ConnectionOptions } from 'typeorm'

// TypeORM wants to normalize all camelCase table names to snake_case by default,
//  which has surprisingly proved troublesome.
class IdentityNamingStrategy extends DefaultNamingStrategy {
    tableName(targetName: string) {
        return targetName
    }
}

const defaultOpts: Partial<ConnectionOptions> = {
    namingStrategy: new IdentityNamingStrategy(),
}

export default defaultOpts
