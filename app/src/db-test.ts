export async function runDatabaseTest() {
    console.log('So...........')
    var knex = require('react-native-knex').default({
        dialect: 'sqlite3',
    });
    console.log('Yeah...')
    
    await knex.schema
        .createTable('users', function(table : any) {
            table.increments('id');
            table.string('user_name');
        })
        .createTable('accounts', function(table : any) {
            table.increments('id');
            table.string('account_name');
            table.integer('user_id').unsigned().references('users.id');
        })
    
    console.log('Yeah...')

    const rows1 = await knex.insert({user_name: 'Tim'}).into('users')
    await knex.table('accounts').insert({account_name: 'knex', user_id: rows1[0]})

    const rows2 = await knex('users')
            .join('accounts', 'users.id', 'accounts.user_id')
            .select('users.user_name as user', 'accounts.account_name as account');
    
    rows2.map(function(row : any) {
        console.log(row)
    })
}
