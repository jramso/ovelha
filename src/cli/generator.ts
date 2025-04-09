import { type Model } from '../language/generated/ast.js';
//import { expandToNode, toString } from 'langium/generate';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { extractDestinationAndName } from './cli-util.js';

export function generateJava(model: Model, filePath: string, destination: string | undefined): void {
    const data = extractDestinationAndName(filePath, destination);
    //const generatedFilePath = `${path.join(data.destination, data.name)}.java`;

    // const fileNode = expandToNode`
    //     "use strict"; 

    // `.appendNewLineIfNotEmpty();
    //model.classes[0].features[0].name;

    const gerarClassesJava = (nomeClasse:string, features: any[])=>{
        const campos = features.filter(feature => feature.$type === 'Attribute')
        .map(attr => ` private ${attr.type} ${attr.name};`) // por enquanto todos os atributos serao privados
        .join('\n')

        return `public class ${nomeClasse} {\n${campos}\n}`;
    };

    // Gera o código para todas as classes (aqui ele gera as classes no mesmo arquivo)
    //const fileContent = model.classes.map(cls => gerarClassesJava(cls.name, cls.features)).join('\n\n');


    model.classes.forEach(cls => {
        const fileContent = gerarClassesJava(cls.name, cls.features);
        const generatedFilePath = path.join(data.destination, `${cls.name}.java`);
        fs.writeFileSync(generatedFilePath, fileContent);
        console.log(`Arquivo Java gerado: ${generatedFilePath}`);
    });

    // Cria o diretório de destino se ele não existir
    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }

    // Escreve o arquivo gerado
    //fs.writeFileSync(generatedFilePath, fileContent);
    //return generatedFilePath;    
}
