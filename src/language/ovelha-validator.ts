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
        //Class: validator.checkClassStartsWithCapital
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class OvelhaValidator {

    // checkClassStartsWithCapital(classObj: Class, accept: ValidationAcceptor): void {
    //     if (classObj.name) {
    //         const firstChar = classObj.name.charAt(0);
    //         if (firstChar.toUpperCase() !== firstChar) {
    //             accept('warning', 'Class name should start with a capital.', { node: classObj, property: 'name' });
    //         }
    //     }
    // }

}
