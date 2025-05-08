import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Model } from '../../../language/generated/ast.js';

// Interface para representar os atributos
interface Attribute {
    name: string;
    type: string;
}

export function generateVueFrontend(model: Model, projectPath: string): void {
    const frontendDir = path.join(projectPath, 'frontend');
    const srcDir = path.join(frontendDir, 'src');
    const componentsDir = path.join(srcDir, 'components');

    // Cria os diretórios necessários
    if (!fs.existsSync(frontendDir)) {
        fs.mkdirSync(frontendDir, { recursive: true });
    }
    if (!fs.existsSync(srcDir)) {
        fs.mkdirSync(srcDir, { recursive: true });
    }
    if (!fs.existsSync(componentsDir)) {
        fs.mkdirSync(componentsDir, { recursive: true });
    }

    // Gera os arquivos principais
    generateIndexHtml(frontendDir);
    generateAppVue(srcDir);
    generateMainJs(srcDir);
    generateRouterJs(srcDir, model);
    generatePackageJson(frontendDir);

    // Gera os componentes Vue.js para cada classe
    model.classes.forEach(cls => {
        generateComponentForClass(cls, componentsDir);
    });

    console.log(`Frontend Vue.js gerado com sucesso em: ${frontendDir}`);
}

function generateIndexHtml(frontendDir: string): void {
    const content = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Projeto Spring</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap @5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
</body>
</html>
    `;

    fs.writeFileSync(path.join(frontendDir, 'index.html'), content);
}

function generateAppVue(srcDir: string): void {
    const content = `
<template>
  <div class="container mt-5">
    <h1>Bem-vindo ao Projeto Spring</h1>
    <nav>
      <router-link to="/pessoa">Gerenciar Pessoas</router-link> |
      <router-link to="/pet">Gerenciar Pets</router-link>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>
    `;

    fs.writeFileSync(path.join(srcDir, 'App.vue'), content);
}

function generateMainJs(srcDir: string): void {
    const content = `
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

createApp(App).use(router).mount('#app');
    `;

    fs.writeFileSync(path.join(srcDir, 'main.js'), content);
}

function generateRouterJs(srcDir: string, model: Model): void {
    const routes = model.classes
        .map(cls => `{
    path: '/${cls.name.toLowerCase()}',
    component: () => import('./components/${cls.name}Form.vue')
}`).join(',\n');

    const content = `
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
${routes}
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
    `;

    fs.writeFileSync(path.join(srcDir, 'router.js'), content);
}

function generatePackageJson(frontendDir: string): void {
    const content = `
{
  "name": "frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.3.4",
    "vue-router": "^4.2.0",
    "axios": "^1.4.0",
    "bootstrap": "^5.3.0"
  },
  "devDependencies": {
    "vite": "^4.0.0"
  }
}
    `;

    fs.writeFileSync(path.join(frontendDir, 'package.json'), content);
}

function generateComponentForClass(cls: any, componentsDir: string): void {
    // Filtra apenas os atributos válidos
    const fields: Attribute[] = cls.features
        .filter((feature: any) => feature.$type === 'Attribute' && feature.name && feature.type)
        .map((attr: any) => ({
            name: attr.name.trim(), // Remove espaços em branco
            type: attr.type.trim()  // Remove espaços em branco
        }));

    // Verifica se há campos válidos
    if (fields.length === 0) {
        console.warn(`Nenhum campo válido encontrado para a classe ${cls.name}.`);
        return;
    }

    // Gera os campos do formulário
    const formFields = fields
        .map((field: Attribute) => `<div class="mb-3">
    <label for="${field.name}" class="form-label">${capitalizeFirstLetter(field.name)}</label>
    <input type="text" class="form-control" id="${field.name}" v-model="formData.${field.name}">
  </div>`)
        .join('\n');

    // Gera o conteúdo do componente Vue.js
    const content = `
<template>
  <div class="container mt-5">
    <h2>Cadastro de ${cls.name}</h2>
    <form @submit.prevent="submitForm">
      ${formFields}
      <button type="submit" class="btn btn-primary">Salvar</button>
    </form>

    <h3 class="mt-5">Lista de ${cls.name}(s)</h3>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>ID</th>
          ${fields.map((field: Attribute) => `<th>${capitalizeFirstLetter(field.name)}</th>`).join('\n')}
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.id">
          <td>{{ item.id }}</td>
          ${fields.map((field: Attribute) => `<td>{{ item.${field.name} }}</td>`).join('\n')}
          <td>
            <button class="btn btn-warning me-2" @click="editItem(item)">Editar</button>
            <button class="btn btn-danger" @click="deleteItem(item.id)">Excluir</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      formData: {
        ${fields.map((field: Attribute) => `${field.name}: ''`).join(',\n')}
      },
      items: [],
      editingId: null,
    };
  },
  methods: {
    async fetchItems() {
      try {
        const response = await axios.get(\`http://localhost:8080/${cls.name.toLowerCase()}\`);
        this.items = response.data;
      } catch (error) {
        console.error('Erro ao buscar itens:', error);
      }
    },
    async submitForm() {
      try {
        if (this.editingId) {
          await axios.put(\`http://localhost:8080/${cls.name.toLowerCase()}/\${this.editingId}\`, this.formData);
          this.editingId = null;
        } else {
          await axios.post(\`http://localhost:8080/${cls.name.toLowerCase()}\`, this.formData);
        }
        this.formData = { ${fields.map((field: Attribute) => `${field.name}: ''`).join(', ')} };
        this.fetchItems();
      } catch (error) {
        console.error('Erro ao salvar dados:', error);
      }
    },
    editItem(item) {
      this.formData = { ...item };
      this.editingId = item.id;
    },
    async deleteItem(id) {
      try {
        await axios.delete(\`http://localhost:8080/${cls.name.toLowerCase()}/\${id}\`);
        this.fetchItems();
      } catch (error) {
        console.error('Erro ao excluir item:', error);
      }
    },
  },
  created() {
    this.fetchItems();
  },
};
</script>
    `;

    // Escreve o arquivo Vue.js
    fs.writeFileSync(path.join(componentsDir, `${cls.name}Form.vue`), content);
}

function capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}