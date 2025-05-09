import type { Model } from '../language/generated/ast.js';
import chalk from 'chalk';
import { Command } from 'commander';
import { OvelhaLanguageMetaData } from '../language/generated/module.js';
import { createOvelhaServices } from '../language/ovelha-module.js';
import { extractAstNode } from './cli-util.js';
import { NodeFileSystem } from 'langium/node';
import * as url from 'node:url';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { generateSpringBootProject } from './backend/java/springboot/entity/springboot-generator.js';
import { generateVueFrontend } from './frontend/vue/vueGenerator.js';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const packagePath = path.resolve(__dirname, '..', '..', 'package.json');
const packageContent = await fs.readFile(packagePath, 'utf-8');

// Função para gerar o backend
export const generateBackendAction = async (fileName: string, opts: GenerateOptions): Promise<void> => {
    const services = createOvelhaServices(NodeFileSystem).Ovelha;
    const model = await extractAstNode<Model>(fileName, services);
    const generatedFilePath = generateSpringBootProject(model, fileName, String(opts.destination));
    console.log(chalk.green(`Backend code generated successfully: ${generatedFilePath}`));
};

// Função para gerar o frontend
export const generateFrontendAction = async (fileName: string, opts: GenerateOptions): Promise<void> => {
    const services = createOvelhaServices(NodeFileSystem).Ovelha;
    const model = await extractAstNode<Model>(fileName, services);
    const generatedFilePath = generateVueFrontend(model, String(opts.destination));
    console.log(chalk.green(`Frontend code generated successfully: ${generatedFilePath}`));
};

export type GenerateOptions = {
    destination?: string;
};

export default function (): void {
    const program = new Command();

    program.version(JSON.parse(packageContent).version);

    const fileExtensions = OvelhaLanguageMetaData.fileExtensions.join(', ');

    // Comando para gerar o backend
    program
        .command('generate_back')
        .argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
        .option('-d, --destination <dir>', 'destination directory of generating')
        .description('Generates a Spring Boot backend with RESTful APIs and MVC architecture')
        .action(generateBackendAction);

    // Comando para gerar o frontend
    program
        .command('generate_front')
        .argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
        .option('-d, --destination <dir>', 'destination directory of generating')
        .description('Generates a Vue.js frontend with Bootstrap-styled forms for each entity')
        .action(generateFrontendAction);

    program.parse(process.argv);
}