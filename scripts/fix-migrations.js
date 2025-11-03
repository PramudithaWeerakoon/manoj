const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

async function main() {
  try {
    console.log('Fixing migration system...')
    
    // Get the migration directory path
    const migrationsDir = path.join(__dirname, '..', 'prisma', 'migrations')
    
    // Check if migrations directory exists and has files
    if (!fs.existsSync(migrationsDir)) {
      console.error('No migrations directory found')
      return
    }
    
    // List all migration directories
    const migrations = fs.readdirSync(migrationsDir)
      .filter(dir => fs.statSync(path.join(migrationsDir, dir)).isDirectory())
    
    if (migrations.length === 0) {
      console.error('No migrations found')
      return
    }
    
    console.log('Found migrations:', migrations)
    
    // Create _prisma_migrations table if it doesn't exist
    const prisma = new PrismaClient()
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
        "id" VARCHAR(36) NOT NULL,
        "checksum" VARCHAR(64) NOT NULL,
        "finished_at" TIMESTAMP WITH TIME ZONE,
        "migration_name" VARCHAR(255) NOT NULL,
        "logs" TEXT,
        "rolled_back_at" TIMESTAMP WITH TIME ZONE,
        "started_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "applied_steps_count" INTEGER NOT NULL DEFAULT 0,

        PRIMARY KEY ("id")
      )
    `
    
    // For each migration, add an entry to the _prisma_migrations table
    for (const migrationDir of migrations) {
      const migrationPath = path.join(migrationsDir, migrationDir, 'migration.sql')
      
      if (!fs.existsSync(migrationPath)) {
        console.log(`Skipping ${migrationDir}: no migration.sql file`)
        continue
      }
      
      const sql = fs.readFileSync(migrationPath, 'utf-8')
      const checksum = require('crypto').createHash('sha256').update(sql).digest('hex')
      
      // Check if migration already exists
      const existingMigration = await prisma.$queryRaw`
        SELECT * FROM "_prisma_migrations" WHERE migration_name = ${migrationDir}
      `
      
      if (existingMigration.length > 0) {
        console.log(`Migration ${migrationDir} already exists in database`)
        continue
      }
      
      // Add migration to the _prisma_migrations table
      await prisma.$executeRaw`
        INSERT INTO "_prisma_migrations" (
          "id", 
          "checksum", 
          "finished_at", 
          "migration_name", 
          "applied_steps_count"
        )
        VALUES (
          ${require('crypto').randomUUID()},
          ${checksum},
          now(),
          ${migrationDir},
          1
        )
      `
      
      console.log(`Marked migration ${migrationDir} as applied`)
    }
    
    console.log('All migrations marked as applied!')
    
    await prisma.$disconnect()
  } catch (error) {
    console.error('Error fixing migrations:', error)
  }
}

main()
