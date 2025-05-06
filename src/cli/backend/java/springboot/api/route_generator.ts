import type { Model } from '../../../../../language/generated/ast.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

export function generateControllers(model: Model, projectPath: string, projectName: string): void {
    const packagePath = 'com.ifes.projetospring.controller';
    const controllerDir = path.join(projectPath, 'src/main/java/com/ifes/projetospring/controller');

    // Cria o diretório se ele não existir
    if (!fs.existsSync(controllerDir)) {
        fs.mkdirSync(controllerDir, { recursive: true });
    }

    // Itera sobre cada classe no modelo
    model.classes.forEach(cls => {
        const content = `
package ${packagePath};

import com.ifes.projetospring.model.${cls.name};
import com.ifes.projetospring.service.${cls.name}Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/${cls.name.toLowerCase()}")
public class ${cls.name}Controller {

    private final ${cls.name}Service ${cls.name.toLowerCase()}Service;

    @Autowired
    public ${cls.name}Controller(${cls.name}Service ${cls.name.toLowerCase()}Service) {
        this.${cls.name.toLowerCase()}Service = ${cls.name.toLowerCase()}Service;
    }

    // Listar todos
    @GetMapping
    public ResponseEntity<List<${cls.name}>> listarTodos() {
        return ResponseEntity.ok(${cls.name.toLowerCase()}Service.listarTodos());
    }

    // Buscar por ID
    @GetMapping("/{id}")
    public ResponseEntity<${cls.name}> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(${cls.name.toLowerCase()}Service.buscarPorId(id));
    }

    // Criar
    @PostMapping
    public ResponseEntity<${cls.name}> criar(@RequestBody ${cls.name} ${cls.name.toLowerCase()}) {
        return ResponseEntity.status(201).body(${cls.name.toLowerCase()}Service.salvar(${cls.name.toLowerCase()}));
    }

    // Atualizar
    @PutMapping("/{id}")
    public ResponseEntity<${cls.name}> atualizar(@PathVariable Long id, @RequestBody ${cls.name} ${cls.name.toLowerCase()}) {
        ${cls.name.toLowerCase()}.setId(id); // Define o ID para garantir a atualização
        return ResponseEntity.ok(${cls.name.toLowerCase()}Service.salvar(${cls.name.toLowerCase()}));
    }

    // Deletar
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        ${cls.name.toLowerCase()}Service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
        `;

        // Escreve o arquivo Java
        const filePath = path.join(controllerDir, `${cls.name}Controller.java`);
        fs.writeFileSync(filePath, content);
    });

    console.log(`Controladores RESTful gerados com sucesso em: ${controllerDir}`);
}