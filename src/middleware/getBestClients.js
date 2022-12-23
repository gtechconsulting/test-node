const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('../model')
const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)
const { Op } = require("sequelize");

const getBestClients = async (req, res) => {
    const {Contract,Job, Profile} = req.app.get('models')
    const {start, end, limit} = req.query

    var limitParam = !limit ? 2 : limit

    const bestClients = await Profile.findAll({
        attributes: ['id', 'firstName', 'lastName'],
        include: [{
                model: Contract,
                required: true,
                as: 'Contractor',
                include: [{
                    model: Job,
                    attributes: ['price'],
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
        limit: limitParam
    })

    if(!bestClients.lenght == 0) return res.status(404).end()

    var clientsArray = []

    bestClients.forEach(client => {
        var sum = 0

        client.Contractor[0].Jobs.forEach( job => {
            sum += job.dataValues.price;
        })

       var client = {
            id: client.id,
            fullName: `${client.firstName} ${client.lastName}`,
            paid: sum
        }

        clientsArray.push(client)
        
    });
    res.json(clientsArray)
}
module.exports = {getBestClients}