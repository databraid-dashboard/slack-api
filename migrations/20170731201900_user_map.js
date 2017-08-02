exports.up = knex => knex.schema.createTable('user_map', (table) => {
  table.increments('id').primary();
  table.integer('user_id').notNullable();
  table.string('user_name', 255).notNullable();
});

exports.down = knex => knex.schema.dropTable('user_map');