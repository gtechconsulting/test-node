const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('../model')
const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)
const { Op } = require("sequelize");

const getJobsUnpaid = async (req, res) => {
    const {Contract, Job} = req.app.get('models')
    const contract = await Job.findAll({
        where: {
        paid: {
            [Op.not]: true
        }
    },include: [
        {
            model: Contract,
            required: true,
            where: {status: {
                [Op.not]: 'terminated'
            },
                [Op.or]: {
                    ContractorId: req.headers.profile_id,
                    ClientId: req.headers.profile_id
                }
            }
        }
    ]})
    if(!contract) return res.status(404).end()
    res.json(contract)
}
module.exports = {getJobsUnpaid}