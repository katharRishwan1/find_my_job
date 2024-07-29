const { shop } = require("../controllers");
const { router } = require("../services/imports");

router.get('/shop/:id?', shop.get);
router.post('/shop', shop.post);
// router.put('/shop/:id', shop.update);
// router.delete('/shop/:id', shop.delete);
// router.post('/shop-status/:id', shop.status)
module.exports = router;