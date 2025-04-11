import type { Model } from '../../../../../language/generated/ast.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

export function generateSpringBootProject(model: Model, projectName: string, destination: string): void {
    const projectPath = path.join(destination, projectName);

    // Cria a estrutura de diretórios
    createDirectoryStructure(projectPath);

    // Gera o arquivo pom.xml
    generatePomXml(projectPath);

    // Gera o arquivo application.properties
    generateApplicationProperties(projectPath);

    // Gera a classe principal do Spring Boot
    generateSpringBootApplicationClass(projectPath, projectName);

    // Gera as classes do modelo
    generateModelClasses(model, projectPath, projectName);

    console.log(`Projeto Spring Boot gerado com sucesso: ${projectPath}`);
}

function createDirectoryStructure(projectPath: string): void {
    const directories = [
        'src/main/java/com/ifes/projetospring/model',
        'src/main/resources',
        'src/test/java/com/ifes/projetospring'
    ];

    directories.forEach(dir => {
        const fullPath = path.join(projectPath, dir);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }
    });
}

function generatePomXml(projectPath: string): void {
    const pomContent = `
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.ifes</groupId>
    <artifactId>projetospring</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>jar</packaging>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.1.0</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
    `;

    fs.writeFileSync(path.join(projectPath, 'pom.xml'), pomContent);
}

function generateApplicationProperties(projectPath: string): void {
    const propertiesContent = `
# Configurações do Spring Boot
server.port=8080
spring.application.name=projetospring
    `;

    fs.writeFileSync(path.join(projectPath, 'src/main/resources/application.properties'), propertiesContent);
}

function generateSpringBootApplicationClass(projectPath: string, projectName: string): void {
    const className = capitalize(projectName.substring(0, projectName.lastIndexOf("."))); //nome do projeto sem o .ov e começando em maiuscula
    const packagePath = 'com.ifes.projetospring';
    const content = `
package ${packagePath};

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ${className}Application {
    public static void main(String[] args) {
        SpringApplication.run(${className}Application.class, args);
    }
}
    `;

    const filePath = path.join(projectPath, 'src/main/java/com/ifes/projetospring', `${className}Application.java`);
    fs.writeFileSync(filePath, content);
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
        let methodsContent = ''; // Conteúdo dos métodos

        // Gera os campos (atributos privados)
        cls.features
            .filter(feature => feature.$type === 'Attribute') // Filtra apenas os atributos
            .forEach(attr => {
                fieldsContent += `    private ${attr.type} ${attr.name};\n`;
            });

        // Gera os métodos
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
        
    }\n`;
                }
            });

        // Monta o conteúdo completo da classe
        const content = `
package ${packagePath};

public class ${cls.name} {
${fieldsContent}

${methodsContent}
}
        `;

        // Escreve o arquivo Java
        const filePath = path.join(modelDir, `${cls.name}.java`);
        fs.writeFileSync(filePath, content);
    });

    console.log(`Classes geradas com sucesso em: ${modelDir}`);
}

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}