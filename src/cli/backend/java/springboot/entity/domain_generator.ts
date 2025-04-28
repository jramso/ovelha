import type { Model } from '../../../../../language/generated/ast.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

export function generateDomain(model: Model, projectPath: string, projectName:string ){
    
    generateModelClasses(model, projectPath, projectName);

    generateRepositoryClasses(model, projectPath, projectName);

    generateServiceClasses(model, projectPath, projectName);

}


function generateModelClasses(model: Model, projectPath: string, projectName: string): void {
    const packagePath = 'com.ifes.projetospring.model';
    const modelDir = path.join(projectPath, 'src/main/java/com/ifes/projetospring/model');

    // Cria o diretório se ele não existir
    if (!fs.existsSync(modelDir)) {
        fs.mkdirSync(modelDir, { recursive: true });
    }

    // Itera sobre cada classe no modelo
    model.classes.forEach(cls => {
        let fieldsContent = ''; // Conteúdo dos atributos
        let methodsContent = ''; // Conteúdo dos métodos (incluindo getters e setters)

        // Gera os campos (atributos privados)
        cls.features
            .filter(feature => feature.$type === 'Attribute') // Filtra apenas os atributos
            .forEach(attr => {
                // Adiciona validações e anotações específicas para JPA
                const annotations = getJpaAnnotations(attr);

                fieldsContent += `
    ${annotations}
    private ${attr.type} ${attr.name};
`;

                // Gera os getters e setters
                methodsContent += `
    public ${attr.type} get${capitalizeFirstLetter(attr.name)}() {
        return this.${attr.name};
    }

    public void set${capitalizeFirstLetter(attr.name)}(${attr.type} ${attr.name}) {
        this.${attr.name} = ${attr.name};
    }
`;
            });

        // Gera os métodos adicionais (se houver)
        cls.features
            .filter(feature => feature.$type === 'Method') // Filtra apenas os métodos
            .forEach(feature => {
                // Verifica explicitamente que estamos lidando com um Method
                if (feature.$type === 'Method') {
                    const method = feature; // TypeScript agora sabe que `method` é do tipo `Method`

                    // Processa os parâmetros do método (se houver)
                    const parameters = method.parameters?.parameters
                        ?.map((param: { type: string; name: string }) => `${param.type} ${param.name}`)
                        .join(', ') || '';

                    methodsContent += `
    public ${method.type} ${method.name}(${parameters}) {
        // TODO: Implementar método
    }
`;
                }
            });

        // Monta o conteúdo completo da classe
        const content = `
package ${packagePath};

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "TB_${cls.name.toUpperCase()}", schema = "DBSIS")
public class ${cls.name} {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

${fieldsContent}

    public ${cls.name}() {
    }

${methodsContent}
}
        `;

        // Escreve o arquivo Java
        const filePath = path.join(modelDir, `${cls.name}.java`);
        fs.writeFileSync(filePath, content);
    });

    console.log(`Classes geradas com sucesso em: ${modelDir}`);
}

// Função auxiliar para capitalizar a primeira letra de uma string
function capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Função para gerar anotações JPA com base no tipo do atributo
function getJpaAnnotations(attr: { type: string; name: string }): string {
    const annotations: string[] = [];

    // Adiciona anotações de validação com base no tipo do atributo
    if (attr.type === 'String') {
        annotations.push('@NotBlank');
    } else if (attr.type === 'int' || attr.type === 'Integer') {
        annotations.push('@Min(0)');
        annotations.push('@Max(100)');
    }

    return annotations.join('\n    ');
}

function generateRepositoryClasses(model: Model, projectPath: string, projectName: string): void {
    const packagePath = 'com.ifes.projetospring.repository';
    const repositoryDir = path.join(projectPath, 'src/main/java/com/ifes/projetospring/repository');

    // Cria o diretório se ele não existir
    if (!fs.existsSync(repositoryDir)) {
        fs.mkdirSync(repositoryDir, { recursive: true });
    }

    // Itera sobre cada classe no modelo
    model.classes.forEach(cls => {
        const content = `
package ${packagePath};

import com.ifes.projetospring.model.${cls.name};
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ${cls.name}Repository extends JpaRepository<${cls.name}, Long> {
}
        `;

        // Escreve o arquivo Java
        const filePath = path.join(repositoryDir, `${cls.name}Repository.java`);
        fs.writeFileSync(filePath, content);
    });

    console.log(`Repositórios gerados com sucesso em: ${repositoryDir}`);
}

function generateServiceClasses(model: Model, projectPath: string, projectName: string): void {
    const packagePath = 'com.ifes.projetospring.service';
    const serviceDir = path.join(projectPath, 'src/main/java/com/ifes/projetospring/service');

    // Cria o diretório se ele não existir
    if (!fs.existsSync(serviceDir)) {
        fs.mkdirSync(serviceDir, { recursive: true });
    }

    // Itera sobre cada classe no modelo
    model.classes.forEach(cls => {
        const content = `
package ${packagePath};

import com.ifes.projetospring.model.${cls.name};
import com.ifes.projetospring.repository.${cls.name}Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ${cls.name}Service {
    private final ${cls.name}Repository ${cls.name.toLowerCase()}Repository;

    @Autowired
    public ${cls.name}Service(${cls.name}Repository ${cls.name.toLowerCase()}Repository) {
        this.${cls.name.toLowerCase()}Repository = ${cls.name.toLowerCase()}Repository;
    }

    public List<${cls.name}> listarTodos() {
        return ${cls.name.toLowerCase()}Repository.findAll();
    }

    public ${cls.name} buscarPorId(Long id) {
        return ${cls.name.toLowerCase()}Repository.findById(id).orElseThrow(() -> new RuntimeException("${cls.name} não encontrado"));
    }

    public ${cls.name} salvar(${cls.name} ${cls.name.toLowerCase()}) {
        return ${cls.name.toLowerCase()}Repository.save(${cls.name.toLowerCase()});
    }

    public void deletar(Long id) {
        ${cls.name.toLowerCase()}Repository.deleteById(id);
    }
}
        `;

        // Escreve o arquivo Java
        const filePath = path.join(serviceDir, `${cls.name}Service.java`);
        fs.writeFileSync(filePath, content);
    });

    console.log(`Serviços gerados com sucesso em: ${serviceDir}`);
}

