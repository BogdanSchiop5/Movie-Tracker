const express = require('express');
const router = express.Router();
const {
    getAllEntities,
    getEntityById,
    createEntity,
    updateEntity,
    deleteEntity
} = require('../controllers/entityController');

router.get('/', getAllEntities);
router.get('/:id', getEntityById);
router.post('/', createEntity);
router.put('/:id', updateEntity);
router.delete('/:id', deleteEntity);

module.exports = router;