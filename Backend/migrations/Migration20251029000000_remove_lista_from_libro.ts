import { Migration } from '@mikro-orm/migrations';

export class Migration20251029000000_remove_lista_from_libro extends Migration {

  async up(): Promise<void> {
    // Primero eliminar la foreign key constraint
    this.addSql(`alter table \`libro\` drop foreign key \`libro_lista_id_foreign\`;`);
    
    // Luego eliminar el índice
    this.addSql(`alter table \`libro\` drop index \`libro_lista_id_index\`;`);
    
    // Finalmente eliminar la columna
    this.addSql(`alter table \`libro\` drop column \`lista_id\`;`);
  }

  async down(): Promise<void> {
    // Revertir: agregar la columna de nuevo
    this.addSql(`alter table \`libro\` add \`lista_id\` int unsigned null;`);
    
    // Agregar el índice
    this.addSql(`alter table \`libro\` add index \`libro_lista_id_index\`(\`lista_id\`);`);
    
    // Agregar la foreign key constraint
    this.addSql(`alter table \`libro\` add constraint \`libro_lista_id_foreign\` foreign key (\`lista_id\`) references \`lista\` (\`id\`) on update cascade on delete set null;`);
  }

}
