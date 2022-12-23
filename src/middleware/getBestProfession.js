const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('../model')
const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)
const { Op } = require("sequelize");

const getBestProfession = async (req, res) => {
    const {Contract,Job, Profile} = req.app.get('models')
    const {start, end} = req.query

    const bestProfession = await Profile.findAll({
        attributes: ['profession'],
        group: ['profession'],
        include: [{
                model: Contract,
                attributes: ['id'],
                required: true,
                as: 'Contractor',
                include: [{
                    model: Job,
                    attributes: [[sequelize.fn('sum', sequelize.col('price')), 'totalEarned']],
                    required: true,
                    group: 'Job.ContractId',
                    where: {paid: true,
                        [Op.or]: {
                            paymentDate: {
                                [Op.between]: [start, end]
                            }
                        }
                    }
                }]
            }],
    })


    bestProfession.sort(function(a, b){
        return b.Contractor[0].Jobs[0].dataValues.totalEarned - a.Contractor[0].Jobs[0].dataValues.totalEarned;
    })

    if(!bestProfession.lenght == 0) return res.status(404).end()
    res.json({
        profession: bestProfession[0].profession,
        totalEarned:bestProfession[0].Contractor[0].Jobs[0].dataValues.totalEarned,
        period: {
            start,
            end
        }
    })
}
module.exports = {getBestProfession}