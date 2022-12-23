const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('../model')
const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)
const { Op } = require("sequelize");

const postMoneyContractorWallet = async (req, res) => {
    const {Contract, Job, Profile} = req.app.get('models')
    const {userId} = req.params
    const {value} = req.body

    const data = await Job.findAll({
        where: {
            paid: {
                [Op.not]: true
            }
        }, 
        attributes: [[sequelize.fn('sum', sequelize.col('price')), 'totalToPay']]
        ,include: [
            {
                model: Contract,
                required: true,
                where: {status: {
                    [Op.not]: 'terminated'
                },
                    [Op.or]: {
                        ContractorId: userId
                    }
                }
            }
        ]
    })

    if(!data) return res.status(404).json({message: `You can't deposit ammount this moment.`})

    const totalToPay = data[0].dataValues.totalToPay

    if(value > (totalToPay/4)) {
        return res.status(404).json({message: `The deposit ammount is invalid in this moment. You can deposit up to: $ ${(totalToPay/4)}`})
    }

    const contractor = await Profile.findOne({where: {id: userId}})

    if(!contractor) return res.status(404).json({message: "Error....try again"})  

    const new_contractor_balance = contractor.balance + value

    const updated = await Profile.update({
        balance: new_contractor_balance
    },{
        where: {id: userId}
    })

    if(!updated) return res.status(404).json({message: "Error....try again"}) 
    
    contractor.balance = new_contractor_balance

    res.json(contractor)


}
module.exports = {postMoneyContractorWallet}