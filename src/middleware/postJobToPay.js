const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('../model')
const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)
const { Op } = require("sequelize");

const postJobToPay = async (req, res) => {
    const {Contract, Job, Profile} = req.app.get('models')
    const {job_id} = req.params
    const contractor = req.profile

    const job = await Job.findOne({
        where: {
        id: job_id
    },include: [
            {
                model: Contract,
                required: true,
                where: {status: {
                    [Op.not]: 'terminated'
                },
                    [Op.or]: {
                        ContractorId: req.headers.profile_id
                    }
                }
            }
        ]
    })

    if(!job) return res.status(404).json({message: "You are not the contractor of this job"})
    
    if(job.paid) return res.status(404).json({message: "Job was payed"})

    if(contractor.balance > job.price) {
        const new_contractor_balance = contractor.balance - job.price

        const contract = await Contract.findOne({where: {id: job.ContractId}})

        if(!contract) return res.status(404).json({message: "Contract not found"})

        const updatedContractor = Profile.update({
            balance: new_contractor_balance
        },{
            where: {id: contract.ContractorId}
        })

        if(!updatedContractor) return res.status(404).json({message: "Error....try again"})

        const client = await Profile.findOne({where: {id: contract.ClientId}})

        const new_client_balance = client.balance + job.price
        
        const updatedClient = await Profile.update({
            balance: new_client_balance
        },{
            where: {id: contract.ClientId}
        })
    
        if(!updatedClient) return res.status(404).json({message: "Error....try again"})  

        const now = Date.now()
        job.paid = true
        job.paymentDate = now

        await Job.update({
            paid: true,
            paymentDate: now
        },{
            where: {id: job_id}
        })

        res.json({job: job, client: client})
    } else {
        return res.status(404).json({message: "You don't have money to pay this job."})
    }
}
module.exports = {postJobToPay}