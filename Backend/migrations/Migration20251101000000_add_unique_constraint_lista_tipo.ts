import { Migration } from '@mikro-orm/migrations';

export class Migration20251101000000_add_unique_constraint_lista_tipo extends Migration {
  async up(): Promise<void> {
    // Agregar UNIQUE constraint en (usuario_id, tipo) para listas predefinidas
    // MySQL no soporta índices parciales con WHERE, así que creamos un constraint único simple
    // La validación de tipos se hace a nivel de aplicación
    this.addSql(`
      ALTER TABLE lista 
      ADD UNIQUE INDEX idx_lista_usuario_tipo (usuario_id, tipo);
    `);
  }

  async down(): Promise<void> {
    // Eliminar el índice único si se hace rollback
    this.addSql(`
      ALTER TABLE lista 
      DROP INDEX idx_lista_usuario_tipo;
    `);
  }
}
