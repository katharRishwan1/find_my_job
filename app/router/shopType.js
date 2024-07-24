const { shopType } = require("../controllers");
const { router } = require("../services/imports");

router.get('/shopType/:id?', shopType.get);
router.post('/shopType', shopType.post);
router.put('/shopType/:id', shopType.update);
router.delete('/shopType/:id', shopType.delete);
router.post('/shopType-status/:id', shopType.status)
module.exports = router;