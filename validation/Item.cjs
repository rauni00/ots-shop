const Validator = require('validator');
const isEmpty = require('is-empty');

function validateItemInput(data) {
    let errors = {};
    data.name = !isEmpty(data.name) ? data.name : '';
    data.price = !isEmpty(data.price) ? data.price : '';
    data.description = !isEmpty(data.description) ? data.description : '';

    if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
        errors.name = 'name must be between 2 and 30 characters';
    }
    if (Validator.isEmpty(data.description)) {
        errors.description = 'description  is required';
    }
    if (Validator.isEmpty(data.price)) {
        errors.price = 'Price  is required';
    }
    if (Validator.isEmpty(data.name)) {
        errors.name = 'name field is required';
    }
    return {
        errors,
        isValid: isEmpty(errors),
    };
}
module.exports = validateItemInput;