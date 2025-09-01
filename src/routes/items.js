const router = require('express').Router();
const {
createItem,
getItems,
getOne,
updateItem,
adjustQuantity,
deleteItem
} = require('../controllers/itemsController');
const { exportCSV } = require('../utils/csv');


router.post('/', createItem); // Create
router.get('/', getItems); // Read list + filters
router.get('/:id', getOne); // Read one
router.put('/:id', updateItem); // Update
router.patch('/:id/adjust', adjustQuantity); // Adjust qty (+/-)
router.delete('/:id', deleteItem); // Delete


router.get('/export/csv/all', exportCSV); // Export


module.exports = router;