import type { ValidationAcceptor, ValidationChecks } from 'langium';
import type { OvelhaAstType, Person } from './generated/ast.js';
import type { OvelhaServices } from './ovelha-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: OvelhaServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.OvelhaValidator;
    const checks: ValidationChecks<OvelhaAstType> = {
        Person: validator.checkPersonStartsWithCapital
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class OvelhaValidator {

    checkPersonStartsWithCapital(person: Person, accept: ValidationAcceptor): void {
        if (person.name) {
            const firstChar = person.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'Person name should start with a capital.', { node: person, property: 'name' });
            }
        }
    }

}
