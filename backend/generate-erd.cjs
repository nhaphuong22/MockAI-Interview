require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function generateERD() {
  try {
    const { rows: tables } = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name NOT IN ('knex_migrations', 'knex_migrations_lock')
      ORDER BY table_name
    `);
    
    const { rows: columns } = await pool.query(`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name NOT IN ('knex_migrations', 'knex_migrations_lock')
    `);
    
    const { rows: fks } = await pool.query(`
      SELECT
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
    `);
    
    let mermaid = "erDiagram\n";
    
    for (const fk of fks) {
      mermaid += "    " + fk.foreign_table_name + " ||--o{ " + fk.table_name + ' : ""\n';
    }
    mermaid += "\n";
    
    for (const table of tables) {
      mermaid += "    " + table.table_name + " {\n";
      const tableCols = columns.filter(c => c.table_name === table.table_name);
      for (const col of tableCols) {
        let type = col.data_type.split(' ')[0].replace(/[^a-zA-Z0-9_]/g, '');
        let isPK = col.column_name === 'id' ? ' PK' : '';
        let isFK = fks.some(fk => fk.table_name === table.table_name && fk.column_name === col.column_name) ? ' FK' : '';
        mermaid += "        " + type + " " + col.column_name + isPK + isFK + "\n";
      }
      mermaid += "    }\n";
    }
    
    const fs = require('fs');
    fs.writeFileSync('erd-output.txt', mermaid);
    console.log("Wrote to erd-output.txt");
    
  } catch (err) {
    console.error("DB Connection Failed or query error:", err.message);
  } finally {
    await pool.end();
  }
}

generateERD();
