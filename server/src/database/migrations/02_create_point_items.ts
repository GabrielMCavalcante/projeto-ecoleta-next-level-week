import Knex from 'knex'

export async function up(knex: Knex) {
    knex.schema.hasTable('point_items').then(exists => {
        return !exists ? knex.schema.createTable('point_items', table => {
            table.integer('point_id').notNullable().references('id').inTable('points')
            table.integer('item_id').notNullable().references('id').inTable('items')
        }) : null
    })
}

export async function down(knex: Knex) {
    knex.schema.dropTableIfExists('point_items')   
}