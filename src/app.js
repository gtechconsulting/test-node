const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('./model')
const {getProfile} = require('./middleware/getProfile')
const {getContracts} = require('./middleware/getContracts')
const {getContractById} = require('./middleware/getContractById')
const {getJobsUnpaid} = require('./middleware/getJobsUnpaid')
const {postJobToPay} = require('./middleware/postJobToPay')
const {postMoneyContractorWallet} = require('./middleware/postMoneyContractorWallet')
const {getBestProfession} = require('./middleware/getBestProfession')
const {getBestClients} = require('./middleware/getBestClients')
const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)
const { Op } = require("sequelize");

/**
 * @returns contract by id
 */
app.get('/contracts/:id',getProfile ,getContractById)

/**
 * @returns lists of contracts for a user
 */
app.get('/contracts',getProfile ,getContracts)

/**
 * @returns list of unpaid jobs for a user
 */
app.get('/jobs/unpaid',getProfile ,getJobsUnpaid)

/**
 * @returns a job paid and the client with new balance
 */
app.post('/jobs/:job_id/pay',getProfile ,postJobToPay)

app.post('/balances/deposit/:userId',getProfile ,postMoneyContractorWallet)

app.get('/admin/best-profession',getProfile ,getBestProfession)

app.get('/admin/best-clients',getProfile ,getBestClients)

module.exports = app;
