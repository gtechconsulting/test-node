const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('../model')
const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)
const { Op } = require("sequelize");

const getContracts = async (req, res) => {
    const {Contract} = req.app.get('models')
    const contract = await Contract.findAll({where: {status: {
        [Op.not]: 'terminated'
    },
        [Op.or]: {
            ContractorId: req.headers.profile_id,
            ClientId: req.headers.profile_id
        }
    }})
    if(!contract) return res.status(404).end()
    res.json(contract)
}
module.exports = {getContracts}