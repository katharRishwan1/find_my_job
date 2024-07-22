const responseMessages = require('../middlewares/response-messages');
const db = require('../model');
const { errorHandlerFunction } = require('../services/common_service1');

module.exports = {
    get:async(req, res) => {
        try{
            const data = await db.role.find();
            if(data.length){
                return res.success({
                    msg:responseMessages[1008],
                    result:data
                })
            };
            return res.success({
                msg:responseMessages[1012]
            })
        } catch(error) {
            errorHandlerFunction(error)
        }
    },
    post: async(req,res) => {
        try{
            const data = await db.role.create(req.body);
            console.log('data-------', data)
            if(data){
                return res.ok({
                    msg:responseMessages[1019],
                    result:data
                });
            };
            return res.clientError({
                msg:responseMessages[1018]
            })
        } catch (error){
            errorHandlerFunction(error)
        }  
    },
    update: async (req, res) =>{
        try{
            const _id = req.params.id;
            const { name } = req.body;
            const filterQuery = {isDeleted: false,_id};
            const checkEixsts = await db.role.findOne(filterQuery);
            if(!checkEixsts){
                return res.clientError({
                    msg:responseMessages[1012]
                });
            };
            const checkUnique = await db.role.findOne({_id:{ $ne:_id}, name,isDeleted:false});
            if(checkUnique){
                return res.clientError({
                    msg:`${name} this type of role is Already taken`
                });
            };
            const data = await db.role.updateOne(filterQuery, {name});
            if(data.modifiedCount){
                return res.success({
                    msg:responseMessages[1032]
                })
            };
            return res.clientError({
                msg:responseMessages[1018]
            });
        } catch(error){
            errorHandlerFunction(error)
        }
    },
    delete: async (req, res) =>{
        try{
            const filterQuery = {_id:req.params.id, isDeleted: false };
            const checkEixst = await db.role.findOne(filterQuery);
            if(!checkEixst){
                return res.clientError({
                    msg:responseMessages[1012]
                });
            };
            checkEixst.isDeleted = true;
            await checkEixst.save();
            return res.success({
                msg:responseMessages[1033]
            });
        } catch(error){
            errorHandlerFunction(error)
        }
    }
};