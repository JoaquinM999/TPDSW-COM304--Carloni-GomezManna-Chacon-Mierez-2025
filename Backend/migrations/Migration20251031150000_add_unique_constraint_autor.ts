import { Migration } from '@mikro-orm/migrations';

export class Migration20251031150000_add_unique_constraint_autor extends Migration {
  async up(): Promise<void> {
    // Agregar índice UNIQUE para prevenir autores duplicados
    this.addSql('ALTER TABLE `autor` ADD UNIQUE INDEX `autor_nombre_apellido_unique` (`nombre`, `apellido`);');
  }

  async down(): Promise<void> {
    // Revertir: eliminar el índice único
    this.addSql('ALTER TABLE `autor` DROP INDEX `autor_nombre_apellido_unique`;');
  }
}
