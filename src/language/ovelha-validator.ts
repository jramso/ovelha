import type { ValidationChecks } from 'langium';
import type { OvelhaAstType } from './generated/ast.js';
import type { OvelhaServices } from './ovelha-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: OvelhaServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.OvelhaValidator;
    const checks: ValidationChecks<OvelhaAstType> = {
        
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class OvelhaValidator {


}
