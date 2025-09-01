const { Parser } = require('json2csv');
const Item = require('../models/Item');


exports.exportCSV = async (req, res) => {
try {
const items = await Item.find({}).lean();
const fields = [
'name', 'sku', 'category', 'brand', 'purchasePrice', 'sellingPrice', 'quantity', 'reorderLevel', 'addedOn', 'updatedOn'
];
const parser = new Parser({ fields });
const csv = parser.parse(items);
res.header('Content-Type', 'text/csv');
res.attachment('electrostock.csv');
return res.send(csv);
} catch (err) {
res.status(500).json({ error: 'Export failed' });
}
};