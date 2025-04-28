# Documentação do Projeto Ovelha - DSL Langium e Sistema Java


Este projeto tem como objetivo principal a geração de um sistema Java completo (Spring Boot + MVC em camadas) a partir de uma DSL desenvolvida com Langium. A DSL utiliza uma sintaxe inspirada em diagramas de classes UML para descrever a estrutura do sistema desejado. Esta documentação está dividida em duas partes: a primeira foca na definição da gramática Langium (parte TypeScript), e a segunda apresenta o sistema gerado em Java.

---

## Parte 1 - Gramática e Parser com Langium (TypeScript)

### 1.1 Introdução

A linguagem "Ovelha" (".ov") é uma DSL criada com Langium para descrever modelos de dados e lógica de aplicação. A entrada é transformada por um parser e um gerador em um projeto Spring Boot.

### 1.2 Gramática Langium (.lang)

```typescript
grammar Ovelha

entry Model:
    (classes+=Classe)+;

Classe:
    'class' name=ID '{'
        features+= Feature*
    '}';

Feature:
    Attribute | Method;

Attribute:
    type = Type name=ID;

Method:
    type = Type name=ID '(' (parameters= ParemeterList)? ')';

ParemeterList:
    parameters+=Parameter (',' parameters+=Parameter)*;

Parameter:
   type = Type name=ID;

Type returns string:
    ('int' | 'String' | 'boolean' | 'float' | 'double' | 'char' | 'byte' | 'short' | 'long');

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;
terminal BOOLEAN: /true|false/;
terminal FLOAT: /-?\d+\.\d+/;
terminal DOUBLE: /-?\d+\.\d+([eE][-+]?\d+)?/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
```

### 1.3 Exemplo de Arquivo `.ov`

```ov
class Pessoa {
    int idade
    String nome
    int somaIdade(int idade)
}

class Pet {
    String especie
    int idade
}
```

### 1.4 Processamento da DSL

- O Langium interpreta o arquivo `.ov` e constrói um modelo em AST.
    
- O gerador percorre a AST e cria arquivos `.java` para cada classe e enum descrito.
    

### 1.5 Estrutura de Geração de Código

- Para cada `classe`:
    
    - Gera: `domain/NomeDaClasse.java`
        
    - Gera: `repository/NomeDaClasseRepository.java`
        
    - Gera: `service/NomeDaClasseService.java`
        
    - Gera: `controller/NomeDaClasseController.java`
        
- Para cada possivel [Futuro] `enum`:
    
    - Gera: `domain/NomeDoEnum.java`
        

---

## Parte 2 - Documentação do Sistema Java Gerado

### 2.1 Como funciona

A DSL Langium define a estrutura do sistema em `.ov`. O gerador converte isso em um projeto Spring Boot com MVC.

### 2.2 Estrutura de Pastas

```
src/main/java/com/projetoSpring/
├── domain/            # Entidades (@Entity)
├── repository/        # Repositórios (JpaRepository)
├── service/           # Lógica de negócio (@Service)
└── controller/        # Controladores REST (@RestController)
```

### 2.3 Exemplo de Sistema Gerado

#### 2.3.1 Pessoa.java

```java
@Entity
public class Pessoa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private int idade;

    // Getters e Setters
}
```

#### 2.3.2 PessoaRepository.java

```java
public interface PessoaRepository extends JpaRepository<Pessoa, Long> {
}
```

#### 2.3.3 PessoaService.java

```java
@Service
public class PessoaService {
    private final PessoaRepository pessoaRepository;

    public PessoaService(PessoaRepository pessoaRepository) {
        this.pessoaRepository = pessoaRepository;
    }

    public List<Pessoa> listarTodas() {
        return pessoaRepository.findAll();
    }
}
```

#### 2.3.4 PessoaController.java

```java
@RestController
@RequestMapping("/pessoas")
public class PessoaController {
    private final PessoaService pessoaService;

    public PessoaController(PessoaService pessoaService) {
        this.pessoaService = pessoaService;
    }

    @GetMapping
    public List<Pessoa> listarTodas() {
        return pessoaService.listarTodas();
    }
}
```

### 2.4 Testes

- **Unitários**: PessoaServiceTest com Mockito
    
- **Integração**: PessoaControllerTest com MockMvc
    

### 2.5 Tecnologias Utilizadas

- Spring Boot
    
- Spring Data JPA
    
- PostgreSQL
    
- JUnit 5 + Mockito
    
- Langium (TypeScript)
    

### 3 Melhorias Futuras

- Suporte a **associações e cardinalidades** entre classes.  
    
- Compatibilidade com **plantUML** para gerar diagramas visuais.  
    
- Suporte a **visibilidade** (`+`, `-`, `#`).  
    
- Geração de **DTOs e validações** com annotations.
---

## Conclusão

Com essa estrutura, você consegue modelar sua aplicação de forma simples e gerar uma estrutura robusta automaticamente. A divisão clara entre a DSL e o código Java gerado permite manutenção, testes e expansão facilitadas.
