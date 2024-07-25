const commonService = require('../services/common_services')
const { Joi } = require('../services/imports')

const create = Joi.object({
    shopType: Joi.string().required().error(commonService.getValidationMessage),
    name: Joi.string().required().error(commonService.getValidationMessage),
    description: Joi.string().error(commonService.getValidationMessage),
    img_url: Joi.string().optional().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage)

const update = Joi.object({
    shopType: Joi.string().optional().error(commonService.getValidationMessage),
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
    validateCreate: async (dataToValidate) =>
        validateFunc(create, dataToValidate),
    validateUpdate: async (dataToValidate) =>
        validateFunc(update, dataToValidate),
}
