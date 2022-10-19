const Validator = require('validator');
const isEmpty = require('is-empty');

function validateProfileInput(data) {
    let errors = {};
    data.fullName = !isEmpty(data.fullName) ? data.fullName : '';
    data.Mobile = !isEmpty(data.Mobile) ? data.Mobile : '';

    if (!Validator.isLength(data.fullName, { min: 2, max: 30 })) {
        errors.fullName = 'fullName must be between 2 and 30 characters';
    }
    if (!Validator.isLength(data.Mobile, { min: 10, max: 10 })) {
        errors.Mobile = 'Phone Number must be 10 Digit';
    }
    if (Validator.isEmpty(data.Mobile)) {
        errors.Mobile = 'Mobile number is required';
    }
    if (Validator.isEmpty(data.fullName)) {
        errors.fullName = 'fullName field is required';
    }

    return {
        errors,
        isValid: isEmpty(errors),
    };
}
module.exports = validateProfileInput;