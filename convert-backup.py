#!/usr/bin/env python3
"""
Converte formato COPY do PostgreSQL para INSERT statements
"""

def convert_copy_to_insert(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    inserts = []
    current_table = None
    current_columns = None
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # Detectar início de COPY
        if line.startswith('COPY public.'):
            # Extrair nome da tabela e colunas
            parts = line.split('(')
            table_name = parts[0].replace('COPY public.', '').strip()
            columns_part = line.split('(')[1].split(')')[0]
            
            current_table = table_name
            current_columns = columns_part
            
            inserts.append(f"\n-- ====================================")
            inserts.append(f"-- TABELA: {table_name.upper()}")
            inserts.append(f"-- ====================================\n")
            
            i += 1
            
            # Ler dados até encontrar \.
            values_list = []
            while i < len(lines):
                data_line = lines[i].rstrip('\n')
                if data_line == '\\.':
                    break
                if data_line:  # Pular linhas vazias
                    # Converter formato COPY para VALUES
                    values = convert_copy_line_to_values(data_line)
                    values_list.append(values)
                i += 1
            
            # Gerar INSERT statements
            if values_list:
                inserts.append(f"INSERT INTO {table_name} ({current_columns}) VALUES")
                for idx, val in enumerate(values_list):
                    if idx < len(values_list) - 1:
                        inserts.append(f"{val},")
                    else:
                        inserts.append(f"{val};")
                inserts.append("")
        
        i += 1
    
    # Escrever arquivo de saída
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("-- ====================================\n")
        f.write("-- IMPORTAÇÃO COMPLETA DE DADOS\n")
        f.write("-- ====================================\n")
        f.write("-- Gerado automaticamente do backup-local.sql\n")
        f.write("-- Copie e cole no Railway Dashboard → Postgres → Data\n\n")
        f.write('\n'.join(inserts))
        
        # Adicionar verificações
        f.write("\n\n-- ====================================\n")
        f.write("-- VERIFICAÇÃO\n")
        f.write("-- ====================================\n")
        f.write("SELECT 'users' as tabela, COUNT(*) as total FROM users\n")
        f.write("UNION ALL\n")
        f.write("SELECT 'companies', COUNT(*) FROM companies\n")
        f.write("UNION ALL\n")
        f.write("SELECT 'consultations', COUNT(*) FROM consultations\n")
        f.write("UNION ALL\n")
        f.write("SELECT 'landscapes', COUNT(*) FROM landscapes;\n")

def convert_copy_line_to_values(line):
    """Converte uma linha COPY para formato VALUES"""
    # Separar por tabs
    fields = line.split('\t')
    
    converted = []
    for field in fields:
        if field == '\\N':  # NULL
            converted.append('NULL')
        elif field.startswith('{') and field.endswith('}'):  # JSON/Array
            # Escapar aspas simples
            escaped = field.replace("'", "''")
            converted.append(f"'{escaped}'")
        else:
            # Escapar aspas simples
            escaped = field.replace("'", "''")
            # Se parece com número, não colocar aspas
            if field.replace('.', '').replace('-', '').isdigit():
                converted.append(field)
            else:
                converted.append(f"'{escaped}'")
    
    return f"({', '.join(converted)})"

if __name__ == '__main__':
    print("🔄 Convertendo backup-local.sql para railway-import-full.sql...")
    convert_copy_to_insert('backup-local.sql', 'railway-import-full.sql')
    print("✅ Conversão concluída!")
    print("📄 Arquivo gerado: railway-import-full.sql")
