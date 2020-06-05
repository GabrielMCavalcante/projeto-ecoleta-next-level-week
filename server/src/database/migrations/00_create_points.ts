import Knex from 'knex'

export async function up(knex: Knex) {
    return knex.schema.hasTable('points').then(exists=>{
        return !exists ? knex.schema.createTable('points', table => {
            table.increments('id').primary()
            table.string('name').notNullable()
            table.string('email').notNullable()
            table.string('whatsapp').notNullable()
            table.decimal('latitude').notNullable()
            table.decimal('longitude').notNullable()
            table.string('city').notNullable()
            table.string('uf', 2).notNullable()
            table.string('image').notNullable()
        }) : null
    })
}

export async function down(knex: Knex) {
    return knex.schema.dropTableIfExists('points')
}