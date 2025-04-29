const Entity = require('../models/entityModel');

const getAllEntities = async (req, res) => {
    try {
        const entities = await Entity.find();
        res.status(200).json(entities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getEntityById = async (req, res) => {
    try {
        const entity = await Entity.findById(req.params.id);
        if (!entity) {
            return res.status(404).json({ message: 'Entity not found' });
        }
        res.status(200).json(entity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createEntity = async (req, res) => {
    try {
        const entity = await Entity.create(req.body);
        res.status(201).json(entity);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateEntity = async (req, res) => {
    try {
        const entity = await Entity.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!entity) {
            return res.status(404).json({ message: 'Entity not found' });
        }
        res.status(200).json(entity);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteEntity = async (req, res) => {
    try {
        const entity = await Entity.findByIdAndDelete(req.params.id);
        if (!entity) {
            return res.status(404).json({ message: 'Entity not found' });
        }
        res.status(200).json({ message: 'Entity deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllEntities,
    getEntityById,
    createEntity,
    updateEntity,
    deleteEntity
};