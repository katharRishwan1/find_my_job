const commonService = require('../services/common_services')
const { Joi } = require('../services/imports')

const createRole = Joi.object({
    name: Joi.string().required().error(commonService.getValidationMessage),
    description: Joi.string().error(commonService.getValidationMessage),
    img_url: Joi.string().optional().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage)

const updateRole = Joi.object({
    name: Joi.string().optional().error(commonService.getValidationMessage),
    description: Joi.string().error(commonService.getValidationMessage),
    img_url: Joi.string().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage)


async function validateFunc(schemaName, dataToValidate) {
    try {
        const { error, value } = schemaName.validate(dataToValidate)
        return {
            error: error ? commonService.convertJoiErrors(error.details) : '',
            validatedData: value,
        }
    } catch (error) {
        return {
            error,
        }
    }
}

module.exports = {
    validateCreateRole: async (dataToValidate) =>
        validateFunc(createRole, dataToValidate),
    validateUpdateRole: async (dataToValidate) =>
        validateFunc(updateRole, dataToValidate),
}
