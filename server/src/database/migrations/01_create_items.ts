import Knex from 'knex'

export async function up(knex: Knex) {
    knex.schema.hasTable('items').then(exists => {
        return !exists ? knex.schema.createTable('items', table => {
            table.increments('id').primary()
            table.string('title').notNullable()
            table.string('image').notNullable()
        }) : null
    })
}

export async function down(knex: Knex) {
    knex.schema.dropTableIfExists('items')
}