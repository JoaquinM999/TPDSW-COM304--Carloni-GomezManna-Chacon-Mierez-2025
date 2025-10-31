import { Migration } from '@mikro-orm/migrations';

export class Migration20251031021933_add_slug_to_libro extends Migration {

  override async up(): Promise<void> {
    // Agregar campo slug a tabla libro
    this.addSql(`alter table \`libro\` add \`slug\` varchar(255) null;`);
    
    // Crear índice para búsquedas rápidas por slug
    this.addSql(`create index \`libro_slug_index\` on \`libro\` (\`slug\`);`);
    
    // Mantener cambio en resena si existe
    this.addSql(`alter table \`resena\` modify \`estado\` enum('pending', 'approved', 'flagged', 'rejected') not null default 'pending';`);
  }

  override async down(): Promise<void> {
    // Eliminar índice
    this.addSql(`drop index \`libro_slug_index\` on \`libro\`;`);
    
    // Eliminar campo slug
    this.addSql(`alter table \`libro\` drop \`slug\`;`);
    
    this.addSql(`alter table \`resena\` modify \`estado\` enum('pending', 'approved', 'flagged') not null default 'pending';`);
  }

}
